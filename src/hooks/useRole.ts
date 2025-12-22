import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useRole() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRole = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      // Use the single-arg overload that uses auth.uid() internally (safer)
      const { data, error } = await supabase
        .rpc('has_role', { _role: 'admin' });

      if (!error && data === true) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkRole();
    }
  }, [user, authLoading, checkRole]);

  return { isAdmin, loading, refetch: checkRole };
}
