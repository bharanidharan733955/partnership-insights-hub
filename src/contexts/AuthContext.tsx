import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export type AppRole = 'analyst' | 'partner';

export interface AuthUser {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: AppRole;
  branch_id?: string | null;
  partner_id?: string | null;
  branch?: { id: string; name: string; location: string } | null;
  partner?: { id: string; name: string } | null;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: AppRole;
  branchId?: string;
  partnerId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_profile');
      if (error) throw error;
      if (data) {
        setUser(data as unknown as AuthUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setUser(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(() => fetchProfile(), 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchProfile();
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (data: SignUpData) => {
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (signUpError) throw signUpError;

    // Create profile + assign role using security definer function
    const { error: profileError } = await supabase.rpc('create_user_profile', {
      _name: data.name,
      _role: data.role,
      _branch_id: data.branchId || null,
      _partner_id: data.partnerId || null,
    });
    if (profileError) throw profileError;

    // Refresh profile data
    await fetchProfile();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
