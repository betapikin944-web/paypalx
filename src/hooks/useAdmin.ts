import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useIsAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      return data as boolean;
    },
    enabled: !!user,
  });
}

export function useAllUsers() {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('*');

      if (balancesError) throw balancesError;

      // Combine profiles with balances
      return profiles.map(profile => ({
        ...profile,
        balance: balances.find(b => b.user_id === profile.user_id)?.amount ?? 0,
        currency: balances.find(b => b.user_id === profile.user_id)?.currency ?? 'USD',
      }));
    },
    enabled: isAdmin === true,
  });
}

export function useAllTransactions() {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });
}
