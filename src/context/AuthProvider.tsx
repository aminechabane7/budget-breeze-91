import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextProps {
  isLoading: boolean;
  user: User | null;
  error: AuthError | null;
  session: Session | null;
  login: (email: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateUser: () => Promise<void>;
  setupSubscription: <T extends any>(
    tableName: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    callback: (payload: { new: T; old: T }) => void
  ) => () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isLoading: false,
  loading: false,
  user: null,
  error: null,
  session: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
  setupSubscription: () => () => {},
});

interface AuthState {
  isLoading: boolean;
  user: User | null;
  error: AuthError | null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    user: null,
    error: null,
  });
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setAuthState({
          isLoading: false,
          user: session?.user || null,
          error: null,
        });
      } catch (error: any) {
        setAuthState({
          isLoading: false,
          user: null,
          error: error,
        });
      }
    };

    getSession();

    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setAuthState({
        isLoading: false,
        user: session?.user || null,
        error: null,
      });
    });
  }, []);

  const login = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setAuthState({
        isLoading: false,
        user: null,
        error: error,
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signUp({ email, password, options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      } });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setAuthState({
        isLoading: false,
        user: null,
        error: error,
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setAuthState({
        isLoading: false,
        user: null,
        error: error,
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = logout;

  const updateUser = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      setAuthState({
        isLoading: false,
        user: user,
        error: null,
      });
    } catch (error: any) {
      setAuthState({
        isLoading: false,
        user: null,
        error: error,
      });
    }
  };

  const setupSubscription = useCallback(<T extends any>(
    tableName: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE',
    callback: (payload: { new: T; old: T }) => void
  ) => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes' as any,
        {
          event: event,
          schema: 'public',
          table: tableName,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const value: AuthContextProps = {
    isLoading: authState.isLoading,
    loading: authState.isLoading,
    user: authState.user,
    error: authState.error,
    session: session,
    login,
    register,
    logout,
    signOut,
    updateUser,
    setupSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
