import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  preferences?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  useEffect(() => {
    // Получение текущего пользователя при загрузке
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          setState({ user: null, loading: false, error: null });
          return;
        }

        // Получение дополнительных данных пользователя
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const { user: userData } = await response.json();
          setState({ user: userData, loading: false, error: null });
        } else {
          setState({ user: null, loading: false, error: 'Failed to fetch user data' });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setState({ user: null, loading: false, error: 'Failed to fetch user' });
      }
    };

    getUser();

    // Подписка на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Получение данных пользователя после входа
          try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
              const { user: userData } = await response.json();
              setState({ user: userData, loading: false, error: null });
            }
          } catch (error) {
            console.error('Error fetching user after sign in:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, loading: false, error: null });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }));
        return { success: false, error: data.error };
      }

      setState({ user: data.user, loading: false, error: null });
      return { success: true, user: data.user };
    } catch {
      const errorMessage = 'Failed to sign in';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }));
        return { success: false, error: data.error };
      }

      setState({ user: data.user, loading: false, error: null });
      return { success: true, user: data.user };
    } catch {
      const errorMessage = 'Failed to sign up';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        setState(prev => ({ ...prev, loading: false, error: data.error }));
        return { success: false, error: data.error };
      }

      setState({ user: null, loading: false, error: null });
      return { success: true };
    } catch {
      const errorMessage = 'Failed to sign out';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }));
        return { success: false, error: data.error };
      }

      setState({ user: data.user, loading: false, error: null });
      return { success: true, user: data.user };
    } catch {
      const errorMessage = 'Failed to update profile';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAdmin: state.user?.role === 'admin',
  };
}