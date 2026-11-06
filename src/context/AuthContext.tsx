import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { UserProfile, AppLanguage } from '../types/index.ts';
import { getSupabase } from '../services/supabase.ts';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: (customName?: string) => void;
  updatePreferences: (prefs: Partial<UserProfile['preferences']>) => void;
  updateProfileName: (username: string) => Promise<void>;
}

const LOCAL_USER_KEY = 'vooter_local_user';

function createDefaultGuestUser(name?: string): UserProfile {
  const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
  const username = name || 'Guest Voter #' + Math.floor(1000 + Math.random() * 9000);
  return {
    id: guestId,
    email: `${guestId}@arcade.local`,
    username,
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
    created_at: new Date().toISOString(),
    is_guest: true,
    preferences: {
      soundMuted: false,
      language: 'en',
      theme: 'dark',
    },
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const supabase = getSupabase();

      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            const userProfile: UserProfile = {
              id: session.user.id,
              email: session.user.email || 'user@vooter.com',
              username: profile?.username || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Voter',
              avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`,
              created_at: profile?.created_at || session.user.created_at,
              is_guest: false,
              preferences: {
                soundMuted: localStorage.getItem('vooter_muted') === 'true',
                language: (localStorage.getItem('vooter_lang') as AppLanguage) || 'en',
                theme: 'dark',
              },
            };
            setUser(userProfile);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase auth session check failed, using local mode:', e);
        }
      }

      // Check local storage for persistent guest user
      if (mounted) {
        const savedLocal = localStorage.getItem(LOCAL_USER_KEY);
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal) as UserProfile;
            setUser(parsed);
          } catch {
            const guest = createDefaultGuestUser();
            setUser(guest);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
          }
        } else {
          const guest = createDefaultGuestUser();
          setUser(guest);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
        }
        setIsLoading(false);
      }
    }

    initSession();

    // Listen for auth state changes if Supabase is active
    const supabase = getSupabase();
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: profile?.username || session.user.user_metadata?.full_name || 'Voter',
            avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`,
            created_at: profile?.created_at || session.user.created_at,
            is_guest: false,
            preferences: {
              soundMuted: localStorage.getItem('vooter_muted') === 'true',
              language: (localStorage.getItem('vooter_lang') as AppLanguage) || 'en',
              theme: 'dark',
            },
          });
        } else if (event === 'SIGNED_OUT') {
          const guest = createDefaultGuestUser();
          setUser(guest);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
        }
      });
      authSubscription = data.subscription;
    }

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        error: 'Supabase is not configured yet. Please enter your Supabase URL & Key in Account Settings, or continue playing in Guest Mode.',
      };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        },
      });
      if (error) return { error: error.message };
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google OAuth failed';
      return { error: msg };
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      // Allow simulated login in demo mode if Supabase isn't configured
      const demoUser: UserProfile = {
        id: 'user_' + btoa(email).substring(0, 10),
        email,
        username: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        created_at: new Date().toISOString(),
        is_guest: false,
        preferences: {
          soundMuted: false,
          language: 'en',
          theme: 'dark',
        },
      };
      setUser(demoUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      return {};
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          username: data.user.user_metadata?.full_name || email.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.id}`,
          created_at: data.user.created_at,
          is_guest: false,
          preferences: {
            soundMuted: false,
            language: 'en',
            theme: 'dark',
          },
        });
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' };
    }
  };

  const signUpWithEmail = async (email: string, pass: string, username: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (!supabase) {
      const demoUser: UserProfile = {
        id: 'user_' + btoa(email).substring(0, 10),
        email,
        username,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        created_at: new Date().toISOString(),
        is_guest: false,
        preferences: {
          soundMuted: false,
          language: 'en',
          theme: 'dark',
        },
      };
      setUser(demoUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
      return {};
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: username,
            name: username,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          },
        },
      });
      if (error) return { error: error.message };
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || email,
          username,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          created_at: data.user.created_at,
          is_guest: false,
          preferences: {
            soundMuted: false,
            language: 'en',
            theme: 'dark',
          },
        });
      }
      return {};
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Registration failed' };
    }
  };

  const signOut = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    const guest = createDefaultGuestUser();
    setUser(guest);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
  };

  const continueAsGuest = (customName?: string) => {
    const guest = createDefaultGuestUser(customName);
    setUser(guest);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guest));
  };

  const updatePreferences = (prefs: Partial<UserProfile['preferences']>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        preferences: { ...prev.preferences, ...prefs },
      };
      if (prefs.language) {
        localStorage.setItem('vooter_lang', prefs.language);
      }
      if (prefs.soundMuted !== undefined) {
        localStorage.setItem('vooter_muted', prefs.soundMuted ? 'true' : 'false');
      }
      if (prev.is_guest) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateProfileName = async (username: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, username };
      if (prev.is_guest) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    const supabase = getSupabase();
    if (supabase && user && !user.is_guest) {
      try {
        await supabase
          .from('profiles')
          .update({ username, updated_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch {
        // ignore
      }
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isGuest: user?.is_guest ?? true,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      continueAsGuest,
      updatePreferences,
      updateProfileName,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
