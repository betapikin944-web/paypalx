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
  const { data: isAdmin, isSuccess: adminCheckComplete } = useIsAdmin();

  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      // Fetch all profiles (RLS allows viewing all profiles)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Fetch all balances (admin RLS policy required)
      const { data: balances, error: balancesError } = await supabase
        .from('balances')
        .select('*');

      if (balancesError) {
        console.error('Error fetching balances:', balancesError);
        throw balancesError;
      }

      // Fetch all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error fetching admin roles:', rolesError);
        // Don't throw, just continue without admin info
      }

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      // Combine profiles with balances and add admin fields
      return (profiles || []).map(profile => ({
        ...profile,
        balance: balances?.find(b => b.user_id === profile.user_id)?.amount ?? 0,
        currency: balances?.find(b => b.user_id === profile.user_id)?.currency ?? 'USD',
        is_suspended: (profile as any).is_suspended ?? false,
        suspension_reason: (profile as any).suspension_reason ?? null,
        transfer_pin: (profile as any).transfer_pin ?? null,
        is_transfer_restricted: (profile as any).is_transfer_restricted ?? false,
        transfer_restriction_message: (profile as any).transfer_restriction_message ?? null,
        is_admin: adminUserIds.has(profile.user_id),
      }));
    },
    enabled: adminCheckComplete && isAdmin === true,
  });
}

export function useAllTransactions() {
  const { data: isAdmin, isSuccess: adminCheckComplete } = useIsAdmin();

  return useQuery({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      return data || [];
    },
    enabled: adminCheckComplete && isAdmin === true,
  });
}
