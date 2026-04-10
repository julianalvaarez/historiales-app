import { Profile } from '@/lib/supabase';
import { Stats } from './Dashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FriendCardProps {
  friend: Profile;
  stats: Stats;
  onClick: () => void;
}

export default function FriendCard({ friend, stats, onClick }: FriendCardProps) {
  const matchDiff = stats.wins - stats.losses;
  
  return (
    <button
      onClick={onClick}
      className="bg-card hover:ring-2 hover:ring-primary/50 transition-all border border-border rounded-2xl overflow-hidden group text-left flex flex-col active:scale-95 cursor-pointer"
    >
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-lg">
            {friend.name.charAt(0)}
          </div>
          {matchDiff > 0 ? (
            <div className="flex items-center gap-1 text-win text-sm font-semibold bg-win/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              +{matchDiff}
            </div>
          ) : matchDiff < 0 ? (
            <div className="flex items-center gap-1 text-loss text-sm font-semibold bg-loss/10 px-2 py-1 rounded-full">
              <TrendingDown className="w-3.5 h-3.5" />
              {matchDiff}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-draw text-sm font-semibold bg-draw/10 px-2 py-1 rounded-full">
              <Minus className="w-3.5 h-3.5" />
              0
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold mb-1 truncate">{friend.name}</h3>
      </div>

      <div className="bg-secondary/30 grid grid-cols-3 divide-x divide-border border-t border-border">
        <div className="py-3 text-center">
          <div className="text-lg font-bold text-win">{stats.wins}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold">V</div>
        </div>
        <div className="py-3 text-center">
          <div className="text-lg font-bold text-draw">{stats.draws}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold">E</div>
        </div>
        <div className="py-3 text-center">
          <div className="text-lg font-bold text-loss">{stats.losses}</div>
          <div className="text-[10px] text-muted-foreground uppercase font-bold">D</div>
        </div>
      </div>
    </button>
  );
}
