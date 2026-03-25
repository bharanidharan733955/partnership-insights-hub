import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authLogin, authRegister, authGoogleLogin, authGoogleRegister } from '@/lib/api';

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
  branchName: string;
  branchLocation: string;
}

interface GoogleSignUpData {
  idToken: string;
  name: string;
  password: string;
  branchName: string;
  branchLocation: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  googleSignUp: (data: GoogleSignUpData) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN = 'auth_token';
const AUTH_USER = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_USER);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(AUTH_USER);
        localStorage.removeItem(AUTH_TOKEN);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const { user: u, token } = await authLogin(email, password);
    const normalized = normalizeUser(u);
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(AUTH_USER, JSON.stringify(normalized));
    setUser(normalized);
  };

  const signUp = async (data: SignUpData) => {
    const { user: u, token } = await authRegister(data);
    const normalized = normalizeUser(u);
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(AUTH_USER, JSON.stringify(normalized));
    setUser(normalized);
  };

  const googleSignUp = async (data: GoogleSignUpData) => {
    const { user: u, token } = await authGoogleRegister(data);
    const normalized = normalizeUser(u);
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(AUTH_USER, JSON.stringify(normalized));
    setUser(normalized);
  };

  const googleSignIn = async (idToken: string) => {
    const { user: u, token } = await authGoogleLogin(idToken);
    const normalized = normalizeUser(u);
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(AUTH_USER, JSON.stringify(normalized));
    setUser(normalized);
  };

  const signOut = async () => {
    localStorage.removeItem(AUTH_TOKEN);
    localStorage.removeItem(AUTH_USER);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, googleSignUp, googleSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

function normalizeUser(u: any): AuthUser {
  return {
    id: u.id || u.user_id,
    user_id: u.user_id || u.id,
    email: u.email,
    name: u.name,
    role: (u.role || 'partner').toLowerCase() as AppRole,
    branch_id: u.branch_id ?? u.branch?.id ?? null,
    partner_id: u.partner_id ?? u.partner?.id ?? null,
    branch: u.branch || null,
    partner: u.partner || null,
  };
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
