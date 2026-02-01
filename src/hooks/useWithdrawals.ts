import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  linked_card_id: string | null;
  amount: number;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_holder_name: string;
  status: string;
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalWithProfile extends WithdrawalRequest {
  profile?: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export function useWithdrawals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async (): Promise<WithdrawalRequest[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as WithdrawalRequest[];
    },
    enabled: !!user,
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      amount: number;
      bankName: string;
      accountNumber: string;
      routingNumber: string;
      accountHolderName: string;
      linkedCardId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: input.amount,
          bank_name: input.bankName,
          account_number: input.accountNumber,
          routing_number: input.routingNumber,
          account_holder_name: input.accountHolderName,
          linked_card_id: input.linkedCardId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      toast.success('Withdrawal request submitted!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit withdrawal');
    },
  });
}

// Admin hooks
export function useAllWithdrawals() {
  return useQuery({
    queryKey: ['all-withdrawals'],
    queryFn: async (): Promise<WithdrawalWithProfile[]> => {
      const { data: withdrawals, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!withdrawals) return [];

      // Get unique user IDs
      const userIds = [...new Set(withdrawals.map(w => w.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return withdrawals.map(w => ({
        ...w,
        profile: profileMap.get(w.user_id) || null,
      })) as WithdrawalWithProfile[];
    },
  });
}

export function useUpdateWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      status: string;
      adminNotes?: string;
    }) => {
      const updates: Record<string, unknown> = {
        status: input.status,
        updated_at: new Date().toISOString(),
      };

      if (input.adminNotes !== undefined) {
        updates.admin_notes = input.adminNotes;
      }

      if (input.status === 'completed' || input.status === 'rejected') {
        updates.processed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('withdrawal_requests')
        .update(updates)
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-withdrawals'] });
      toast.success('Withdrawal updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update withdrawal');
    },
  });
}

export function useAllLinkedCards() {
  return useQuery({
    queryKey: ['all-linked-cards'],
    queryFn: async () => {
      const { data: cards, error } = await supabase
        .from('linked_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!cards) return [];

      // Get unique user IDs
      const userIds = [...new Set(cards.map(c => c.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return cards.map(c => ({
        ...c,
        profile: profileMap.get(c.user_id) || null,
      }));
    },
  });
}
