'use client';

import { useState, useEffect } from 'react';
import { supabase, Profile, Match } from '@/lib/supabase';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import { Trophy, LogOut, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';


export default function Home() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    fetchProfiles();
    const storedUserId = localStorage.getItem('fifa-user-id');
    if (storedUserId) {
      checkUser(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name', { ascending: true });

    if (data) setProfiles(data);
  };

  const checkUser = async (id: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (data) {
      setCurrentUser(data);
    } else {
      localStorage.removeItem('fifa-user-id');
    }
    setLoading(false);
  };

  const handleLogin = (user: Profile) => {
    localStorage.setItem('fifa-user-id', user.id);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('fifa-user-id');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-height-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <Trophy className="w-12 h-12 text-primary mb-4" />
          <p className="text-muted-foreground font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">FIFA </h1>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/stats" 
              className="p-2 hover:bg-primary/10 hover:text-primary rounded-full transition-colors text-muted-foreground flex items-center gap-2"
              title="Estadísticas Globales"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-bold uppercase tracking-tighter">Estadísticas</span>
            </Link>

            {currentUser && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{currentUser.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors text-muted-foreground cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {!currentUser ? (
          <Login profiles={profiles} onSelect={handleLogin} />
        ) : (
          <Dashboard currentUser={currentUser} allProfiles={profiles} />
        )}
      </div>
    </main>
  );
}
