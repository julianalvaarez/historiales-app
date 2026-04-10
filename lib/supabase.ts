import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nxwnvixbuawzaeqafekp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d252aXhidWF3emFlcWFmZWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NjU1NTgsImV4cCI6MjA5MTM0MTU1OH0.qHFfg6DRLzGDxwcYbDbZZ721C2-ekvC_oB8BLltmEWQ';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  created_at: string;
};

export type Match = {
  id: string;
  creator_id: string;
  opponent_id: string;
  user_score: number;
  opponent_score: number;
  created_at: string;
};
