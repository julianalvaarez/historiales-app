import { Profile } from '@/lib/supabase';
import { User, ChevronRight } from 'lucide-react';

interface LoginProps {
  profiles: Profile[];
  onSelect: (user: Profile) => void;
}

export default function Login({ profiles, onSelect }: LoginProps) {
  return (
    <div className="max-w-md mx-auto animate-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">Bienvenido</h2>
        <p className="text-muted-foreground">Selecciona tu perfil para comenzar a registrar tus partidos.</p>
      </div>

      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center p-8 bg-card rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground">No se encontraron perfiles.</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className="w-full flex items-center justify-between p-4 bg-card hover:bg-secondary/50 border border-border rounded-xl transition-all group active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <User className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg">{profile.name}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors translate-x-0 group-hover:translate-x-1" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
