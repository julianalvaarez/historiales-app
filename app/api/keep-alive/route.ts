import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // Verificar el secreto
        const authHeader = request.headers.get("authorization");

        if (authHeader !== `Bearer ${process.env.KEEP_ALIVE_SECRET}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { error } = await supabase
            .from("products")
            .select("id")
            .limit(1);

        if (error) {
            console.error("Supabase keep-alive error:", error);

            return NextResponse.json(
                {
                    success: false,
                    error: error.message,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Supabase keep-alive OK",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Keep-alive error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}