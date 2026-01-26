import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Balance {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  updated_at: string;
}

export function useBalance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to realtime balance changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`balance-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'balances',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('💰 Balance updated in realtime:', payload);
          // Invalidate the balance query to refetch
          queryClient.invalidateQueries({ queryKey: ['balance', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ['balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Balance | null;
    },
    enabled: !!user,
  });
}

export function useUpdateBalance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newAmount: number) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('balances')
        .update({ amount: newAmount })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
