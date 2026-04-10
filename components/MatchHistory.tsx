import { Profile, Match } from '@/lib/supabase';
import { Plus, Trophy, History, Calendar } from 'lucide-react';

interface MatchHistoryProps {
  currentUser: Profile;
  friend: Profile;
  matches: Match[];
  onAddMatch: () => void;
}

export default function MatchHistory({ currentUser, friend, matches, onAddMatch }: MatchHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center font-bold text-2xl text-primary border-2 border-primary/50">
            {friend.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{friend.name}</h2>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <History className="w-4 h-4" />
              {matches.length} {matches.length === 1 ? 'partido jugado' : 'partidos jugados'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onAddMatch}
          className="sports-gradient text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nuevo Partido
        </button>
      </div>

      <div className="space-y-3">
        {matches.length === 0 ? (
          <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Aún no hay partidos registrados con {friend.name}.</p>
          </div>
        ) : (
          matches.map((match) => {
            const isCreator = match.creator_id === currentUser.id;
            const userScore = isCreator ? match.user_score : match.opponent_score;
            const friendScore = isCreator ? match.opponent_score : match.user_score;
            const result = userScore > friendScore ? 'win' : userScore < friendScore ? 'loss' : 'draw';

            return (
              <div 
                key={match.id}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-primary/30"
              >
                <div className="flex items-center gap-6 flex-1 justify-center sm:justify-start">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{currentUser.name}</span>
                    <span className={`text-2xl font-black w-10 h-10 flex items-center justify-center rounded-lg ${
                      result === 'win' ? 'bg-win/20 text-win' : 
                      result === 'loss' ? 'bg-loss/20 text-loss' : 
                      'bg-draw/20 text-draw'
                    }`}>
                      {userScore}
                    </span>
                  </div>
                  
                  <div className="text-muted-foreground font-bold">-</div>

                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-black w-10 h-10 flex items-center justify-center rounded-lg ${
                      result === 'loss' ? 'bg-win/20 text-win' : 
                      result === 'win' ? 'bg-loss/20 text-loss' : 
                      'bg-draw/20 text-draw'
                    }`}>
                      {friendScore}
                    </span>
                    <span className="font-bold text-lg">{friend.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground text-xs bg-secondary/30 px-3 py-1.5 rounded-full border border-border">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(match.created_at)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
