import { useState } from 'react';
import { supabase, Profile } from '@/lib/supabase';
import { X, Trophy, Save } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MatchModalProps {
  currentUser: Profile;
  friend: Profile;
  onClose: () => void;
  onSave: () => void;
}

export default function MatchModal({ currentUser, friend, onClose, onSave }: MatchModalProps) {
  const [userScore, setUserScore] = useState<number>(0);
  const [friendScore, setFriendScore] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('matches')
      .insert({
        creator_id: currentUser.id,
        opponent_id: friend.id,
        user_score: userScore,
        opponent_score: friendScore
      });

    if (!error) {
      onSave();
      onClose();
    } else {
      console.error('Error saving match:', error);
      alert('Error al guardar el partido');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Nuevo Partido
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10">
          <div className="flex items-center justify-around gap-8">
            {/* User */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-bold text-2xl text-primary border-2 border-primary/50">
                {currentUser.name.charAt(0)}
              </div>
              <span className="font-bold text-center truncate w-full">{currentUser.name}</span>
              <input 
                type="number" 
                min="0"
                value={userScore}
                onChange={(e) => setUserScore(parseInt(e.target.value) || 0)}
                className="w-20 h-20 text-center text-4xl font-black bg-secondary/50 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-2xl outline-none transition-all"
              />
            </div>

            <div className="text-3xl font-black text-muted-foreground italic">VS</div>

            {/* Friend */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-bold text-2xl border-2 border-border">
                {friend.name.charAt(0)}
              </div>
              <span className="font-bold text-center truncate w-full">{friend.name}</span>
              <input 
                type="number" 
                min="0"
                value={friendScore}
                onChange={(e) => setFriendScore(parseInt(e.target.value) || 0)}
                className="w-20 h-20 text-center text-4xl font-black bg-secondary/50 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 rounded-2xl outline-none transition-all"
              />
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-4 font-bold rounded-2xl hover:bg-white/5 border border-border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-4 sports-gradient text-white font-bold rounded-2xl shadow-[0_10px_20px_-5px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Resultado
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
