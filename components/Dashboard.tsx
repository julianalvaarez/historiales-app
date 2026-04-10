import { useState, useEffect, useMemo } from 'react';
import { supabase, Profile, Match } from '@/lib/supabase';
import FriendCard from './FriendCard';
import MatchHistory from './MatchHistory';
import MatchModal from './MatchModal';
import { Users, ChevronLeft } from 'lucide-react';

interface DashboardProps {
  currentUser: Profile;
  allProfiles: Profile[];
}

export interface Stats {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export default function Dashboard({ currentUser, allProfiles }: DashboardProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Profile | null>(null);
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [loading, setLoading] = useState(true);

  const friends = useMemo(() =>
    allProfiles.filter(p => p.id !== currentUser.id),
    [allProfiles, currentUser.id]);

  useEffect(() => {
    fetchMatches();

    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => fetchMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id]);

  const fetchMatches = async () => {
    const { data } = await supabase
      .from('matches')
      .select('*')
      .or(`creator_id.eq.${currentUser.id},opponent_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (data) {
      setMatches(data);
    }
    setLoading(false);
  };

  const calculateH2H = (friendId: string): Stats => {
    const h2hMatches = matches.filter(m =>
      (m.creator_id === currentUser.id && m.opponent_id === friendId) ||
      (m.creator_id === friendId && m.opponent_id === currentUser.id)
    );

    return h2hMatches.reduce((acc, m) => {
      const isCreator = m.creator_id === currentUser.id;
      const userScore = isCreator ? m.user_score : m.opponent_score;
      const friendScore = isCreator ? m.opponent_score : m.user_score;

      if (userScore > friendScore) acc.wins++;
      else if (userScore < friendScore) acc.losses++;
      else acc.draws++;

      acc.goalsFor += userScore;
      acc.goalsAgainst += friendScore;

      return acc;
    }, { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 });
  };

  const currentFriendMatches = useMemo(() => {
    if (!selectedFriend) return [];
    return matches.filter(m =>
      (m.creator_id === currentUser.id && m.opponent_id === selectedFriend.id) ||
      (m.creator_id === selectedFriend.id && m.opponent_id === currentUser.id)
    );
  }, [matches, selectedFriend, currentUser.id]);

  if (selectedFriend) {
    return (
      <div className="animate-in">
        <button 
          onClick={() => setSelectedFriend(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Volver a la lista
        </button>

        <MatchHistory
          currentUser={currentUser}
          friend={selectedFriend}
          matches={currentFriendMatches}
          onAddMatch={() => setIsAddingMatch(true)}
        />

        {isAddingMatch && (
          <MatchModal
            currentUser={currentUser}
            friend={selectedFriend}
            onClose={() => setIsAddingMatch(false)}
            onSave={fetchMatches}
          />
        )}
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Amigos
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map(friend => (
          <FriendCard
            key={friend.id}
            friend={friend}
            stats={calculateH2H(friend.id)}
            onClick={() => setSelectedFriend(friend)}
          />
        ))}
      </div>
    </div>
  );
}
