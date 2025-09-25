import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  async function getProfile(userId: string): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,name,role')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as AppUser;
  }

  async function ensureProfile(userId: string, email: string, name?: string, role: string = 'CASHIER') {
    const existing = await getProfile(userId);
    if (existing) return existing;
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, email, name: name || email.split('@')[0], role })
      .select('id,email,name,role')
      .single();
    if (error) return null;
    return data as AppUser;
  }

  useEffect(() => {
    // Initial load
    (async () => {
      setIsAuthLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const profile = await ensureProfile(data.user.id, data.user.email || '');
        setUser(profile);
      } else {
        setUser(null);
      }
      setIsAuthLoading(false);
    })();

    // Listen for auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await ensureProfile(session.user.id, session.user.email || '');
        setUser(profile);
      } else {
        setUser(null);
        queryClient.clear();
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const profile = await ensureProfile(data.user.id, email);
    setUser(profile);
    setIsAuthLoading(false);
  };

  const register = async (email: string, password: string, name: string, role?: string) => {
    setIsAuthLoading(true);
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    // If email confirmations are disabled, a session/user is available now
    if (data.user) {
      const profile = await ensureProfile(data.user.id, email, name, role || 'CASHIER');
      setUser(profile);
    }
    setIsAuthLoading(false);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const isAuthenticated = !!user;
  const isAuthLoading = isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        login,
        register,
        logout,
        isLoading: isAuthLoading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Local user shape stored in profiles
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CASHIER' | 'KITCHEN' | string;
}