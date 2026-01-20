import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const REMEMBER_ME_KEY = 'auth_remember_me';
const SESSION_MARKER_KEY = 'auth_session_active';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if session should be cleared (Remember Me was off and browser was closed)
  useEffect(() => {
    const checkRememberMe = async () => {
      const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
      const sessionMarker = sessionStorage.getItem(SESSION_MARKER_KEY);
      
      // If Remember Me was explicitly set to false and session marker is gone (new browser session)
      if (rememberMe === 'false' && !sessionMarker) {
        // Sign out the user
        await supabase.auth.signOut();
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
      
      // Set session marker for current browser session
      sessionStorage.setItem(SESSION_MARKER_KEY, 'true');
    };
    
    checkRememberMe();
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = true) => {
    // Store remember me preference
    localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
    
    // Set session marker
    sessionStorage.setItem(SESSION_MARKER_KEY, 'true');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    // Clear remember me preference on explicit sign out
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(SESSION_MARKER_KEY);
    
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  }, []);

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!session,
  };
}
