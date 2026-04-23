'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase, Profile, Match } from '@/lib/supabase';
import { Trophy, TrendingUp, TrendingDown, Users, ChevronLeft, Shield, Activity, Hash, Scale, Zap } from 'lucide-react';
import Link from 'next/link';

interface PlayerStats extends Stats {
  id: string;
  name: string;
  totalGames: number;
  points: number;
  average: number;
}

interface Stats {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface PairStats {
  p1: string;
  p2: string;
  p1Name: string;
  p2Name: string;
  totalGames: number;
  p1Wins: number;
  p2Wins: number;
  draws: number;
  diff: number;
  avgGoals: number;
}

export default function GlobalStats() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [profilesRes, matchesRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('matches').select('*')
    ]);

    if (profilesRes.data) setProfiles(profilesRes.data);
    if (matchesRes.data) setMatches(matchesRes.data);
    setLoading(false);
  };

  const stats = useMemo(() => {
    if (profiles.length === 0) return null;

    const playerMap: Record<string, PlayerStats> = {};
    const pairMap: Record<string, PairStats> = {};

    profiles.forEach(p => {
      playerMap[p.id] = {
        id: p.id,
        name: p.name,
        wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, totalGames: 0,
        points: 0, average: 0
      };
    });

    matches.forEach(m => {
      const p1 = playerMap[m.creator_id];
      const p2 = playerMap[m.opponent_id];

      if (!p1 || !p2) return;

      p1.totalGames++;
      p1.goalsFor += m.user_score;
      p1.goalsAgainst += m.opponent_score;
      if (m.user_score > m.opponent_score) p1.wins++;
      else if (m.user_score < m.opponent_score) p1.losses++;
      else p1.draws++;

      p2.totalGames++;
      p2.goalsFor += m.opponent_score;
      p2.goalsAgainst += m.user_score;
      if (m.opponent_score > m.user_score) p2.wins++;
      else if (m.opponent_score < m.user_score) p2.losses++;
      else p2.draws++;

      const ids = [m.creator_id, m.opponent_id].sort();
      const pairKey = ids.join('-');
      if (!pairMap[pairKey]) {
        pairMap[pairKey] = {
          p1: ids[0],
          p2: ids[1],
          p1Name: playerMap[ids[0]].name,
          p2Name: playerMap[ids[1]].name,
          totalGames: 0,
          p1Wins: 0,
          p2Wins: 0,
          draws: 0,
          diff: 0,
          avgGoals: 0
        };
      }

      const pKey = pairMap[pairKey];
      pKey.totalGames++;
      pKey.avgGoals += (m.user_score + m.opponent_score);
      if (m.creator_id === ids[0]) {
        if (m.user_score > m.opponent_score) pKey.p1Wins++;
        else if (m.user_score < m.opponent_score) pKey.p2Wins++;
        else pKey.draws++;
      } else {
        if (m.opponent_score > m.user_score) pKey.p1Wins++;
        else if (m.opponent_score < m.user_score) pKey.p2Wins++;
        else pKey.draws++;
      }
      pKey.diff = Math.abs(pKey.p1Wins - pKey.p2Wins);
    });

    const players = Object.values(playerMap).map(p => {
      const points = p.wins * 3 + p.draws;
      const average = p.totalGames > 0 ? points / p.totalGames : 0;
      return { ...p, points, average };
    });
    const pairs = Object.values(pairMap);

    return {
      mostPlayedPair: [...pairs].sort((a, b) => b.totalGames - a.totalGames)[0],
      biggestDiffPair: [...pairs].sort((a, b) => b.diff - a.diff)[0],
      closestPair: [...pairs].filter(p => p.totalGames >= 2).sort((a, b) => {
        if (a.diff !== b.diff) return a.diff - b.diff;
        return b.totalGames - a.totalGames;
      })[0],
      topWinner: [...players].sort((a, b) => b.wins - a.wins)[0],
      topLoser: [...players].sort((a, b) => b.losses - a.losses)[0],
      bestDefense: [...players].filter(p => p.totalGames > 0).sort((a, b) => (a.goalsAgainst / a.totalGames) - (b.goalsAgainst / b.totalGames))[0],
      totalMatches: matches.length,
      avgGoals: matches.length > 0 ? (matches.reduce((acc, m) => acc + m.user_score + m.opponent_score, 0) / matches.length).toFixed(2) : 0,
      standings: [...players].sort((a, b) => {
        if (b.average !== a.average) return b.average - a.average;
        if (b.points !== a.points) return b.points - a.points;
        return b.wins - a.wins;
      })
    };
  }, [profiles, matches]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Trophy className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Volver</span>
          </Link>
          <h1 className="font-black text-xl tracking-tight uppercase">Estadísticas <span className="text-primary">Globales</span></h1>
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Standings Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground">Tabla de Posiciones</h3>
            <span className="text-[10px] text-muted-foreground font-medium">* Ordenado por Promedio</span>
          </div>
          
          <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border">
                    <th className="px-4 py-4 text-[10px] uppercase font-black text-muted-foreground">Pos</th>
                    <th className="px-4 py-4 text-[10px] uppercase font-black text-muted-foreground">Jugador</th>
                    <th className="px-4 py-4 text-[10px] uppercase font-black text-primary text-center">Prom</th>
                    <th className="px-4 py-4 text-[10px] uppercase font-black text-muted-foreground text-center">PJ</th>
                    <th className="px-4 py-4 text-[10px] uppercase font-black text-win text-center">G</th>
                    <th className="px-4 py-4 text-[10px] uppercase font-black text-loss text-center">P</th>
                    <th className="px-4 py-4 text-[10px] uppercase font-black text-muted-foreground text-center">E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats?.standings.map((player, index) => (
                    <tr key={player.id} className="hover:bg-secondary/10 transition-colors group">
                      <td className="px-4 py-4">
                        <span className={`
                          flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-black
                          ${index === 0 ? 'bg-primary text-primary-foreground' : 
                            index === 1 ? 'bg-secondary text-foreground' : 
                            index === 2 ? 'bg-orange-500/20 text-orange-600' : 'text-muted-foreground'}
                        `}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-sm whitespace-nowrap">{player.name}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="inline-flex items-center justify-center px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                          <span className="text-xs font-black text-primary">
                            {player.average.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-sm font-medium text-muted-foreground">
                        {player.totalGames}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-black text-win">{player.wins}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-black text-loss">{player.losses}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-sm font-bold text-muted-foreground">{player.draws}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Cards Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between shadow-sm group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Activity className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-black leading-none mb-1">{stats?.totalMatches}</div>
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Partidos Jugados</div>
              </div>
            </div>
            <div className="text-primary opacity-20">
              <Zap className="w-10 h-10" />
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between shadow-sm group hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Hash className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-black leading-none mb-1">{stats?.avgGoals}</div>
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Goles por partido</div>
              </div>
            </div>
            <div className="text-primary opacity-20">
              <Trophy className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Dynamic Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Best Players */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground px-2">Jugadores Destacados</h3>

            <StatCard
              label="El que más gana"
              name={stats?.topWinner?.name}
              value={`${stats?.topWinner?.wins} Vics`}
              icon={<Trophy className="w-5 h-5 text-win" />}
              bgColor="bg-win/10"
            />

            <StatCard
              label="El que más pierde"
              name={stats?.topLoser?.name}
              value={`${stats?.topLoser?.losses} Derrotas`}
              icon={<TrendingDown className="w-5 h-5 text-loss" />}
              bgColor="bg-loss/10"
            />

            <StatCard
              label="Mejor Defensa"
              name={stats?.bestDefense?.name}
              value={`${(((stats?.bestDefense?.goalsAgainst ?? 0) / (stats?.bestDefense?.totalGames ?? 1)).toFixed(2))} goles/partido`}
              icon={<Shield className="w-5 h-5 text-emerald-500" />}
              bgColor="bg-emerald-500/10"
            />
          </div>

          {/* H2H Highlights */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground px-2">Historiales Clave</h3>

            {stats?.mostPlayedPair && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] uppercase font-black text-primary mb-3 flex items-center gap-2">
                  <Hash className="w-3 h-3" /> Clásico (Más Jugado)
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="font-bold truncate">{stats.mostPlayedPair.p1Name}</div>
                    <div className="text-xl font-black text-primary">{stats.mostPlayedPair.p1Wins}</div>
                  </div>
                  <div className="px-4 text-center">
                    <div className="text-xs text-muted-foreground font-extrabold italic">VS</div>
                    <div className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">{stats.mostPlayedPair.totalGames} PJ</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="font-bold truncate">{stats.mostPlayedPair.p2Name}</div>
                    <div className="text-xl font-black text-primary">{stats.mostPlayedPair.p2Wins}</div>
                  </div>
                </div>
              </div>
            )}

            {stats?.biggestDiffPair && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] uppercase font-black text-loss mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" /> Mayor Paternidad
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="font-bold truncate">{stats.biggestDiffPair.p1Wins > stats.biggestDiffPair.p2Wins ? stats.biggestDiffPair.p1Name : stats.biggestDiffPair.p2Name}</div>
                    <div className="text-win font-black">+{stats.biggestDiffPair.diff}</div>
                  </div>
                  <div className="px-4 text-center">
                    <div className="text-[10px] text-muted-foreground font-bold italic">Sobre</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="font-bold truncate">{stats.biggestDiffPair.p1Wins > stats.biggestDiffPair.p2Wins ? stats.biggestDiffPair.p2Name : stats.biggestDiffPair.p1Name}</div>
                    <div className="text-muted-foreground font-bold text-xs">{Math.min(stats.biggestDiffPair.p1Wins, stats.biggestDiffPair.p2Wins)} vics</div>
                  </div>
                </div>
              </div>
            )}

            {stats?.closestPair && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <div className="text-[10px] uppercase font-black text-win mb-3 flex items-center gap-2">
                  <Scale className="w-3 h-3" /> Duelo más Parejo
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="font-bold truncate">{stats.closestPair.p1Name}</div>
                    <div className="text-xl font-black text-win">{stats.closestPair.p1Wins}</div>
                  </div>
                  <div className="px-4 text-center">
                    <div className="text-xs text-muted-foreground font-extrabold italic">VS</div>
                    <div className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded-full mt-1 whitespace-nowrap">{stats.closestPair.totalGames} PJ</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="font-bold truncate">{stats.closestPair.p2Name}</div>
                    <div className="text-xl font-black text-win">{stats.closestPair.p2Wins}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ label, name, value, icon, bgColor }: { label: string, name?: string, value: string, icon: React.ReactNode, bgColor: string }) {
  return (
    <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={`p-3 rounded-xl flex-shrink-0 ${bgColor}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase font-bold text-muted-foreground leading-tight truncate">{label}</div>
          <div className="font-black text-lg truncate">{name || '---'}</div>
        </div>
      </div>
      <div className="text-sm font-bold bg-secondary/50 px-3 py-1 rounded-full border border-border flex-shrink-0 ml-2">
        {value}
      </div>
    </div>
  );
}
