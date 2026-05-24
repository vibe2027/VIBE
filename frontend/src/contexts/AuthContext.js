import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, FOUNDER_EMAIL } from '@/lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Extracted: Load user profile from Supabase
const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Extracted: Create new profile in Supabase
const createProfile = async (user, displayName, city) => {
  const { error } = await supabase.from('profiles').insert([
    {
      id: user.id,
      display_name: displayName,
      city: city,
      membership_tier: 'free',
      is_online: true,
      real_email: user.email,
      created_at: new Date().toISOString(),
      is_founder: false,
      is_admin: false,
      ghost_mode: false,
      is_immune: false,
    },
  ]);

  if (error) throw error;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const loadProfile = useCallback(async (userId) => {
    try {
      const data = await fetchProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSessionChange = useCallback(
    (newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    },
    [loadProfile]
  );

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleSessionChange(initialSession);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => handleSessionChange(newSession)
    );

    return () => subscription.unsubscribe();
  }, [handleSessionChange]);

  const signUp = useCallback(async (email, password, displayName, city) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        await createProfile(data.user, displayName, city);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const isFounder = useCallback(
    () => user?.email?.toLowerCase() === FOUNDER_EMAIL?.toLowerCase(),
    [user]
  );

  const isAdmin = useCallback(
    () => profile?.is_admin || isFounder(),
    [profile, isFounder]
  );

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isFounder,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
