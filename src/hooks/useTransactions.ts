import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  sender_id: string | null;
  recipient_id: string | null;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
}

export interface TransactionWithProfiles extends Transaction {
  sender_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  recipient_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async (): Promise<TransactionWithProfiles[]> => {
      if (!user) return [];

      // First get transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!transactions) return [];

      // Get unique user IDs
      const userIds = [...new Set([
        ...transactions.map(t => t.sender_id).filter(Boolean),
        ...transactions.map(t => t.recipient_id).filter(Boolean)
      ])] as string[];

      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Combine transactions with profiles
      return transactions.map(t => ({
        ...t,
        sender_profile: t.sender_id ? profileMap.get(t.sender_id) || null : null,
        recipient_profile: t.recipient_id ? profileMap.get(t.recipient_id) || null : null,
      }));
    },
    enabled: !!user,
  });
}

export function useSendMoney() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      recipientId, 
      amount, 
      description 
    }: { 
      recipientId: string; 
      amount: number; 
      description?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get sender's current balance
      const { data: senderBalance, error: balanceError } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;
      if (!senderBalance || Number(senderBalance.amount) < amount) {
        throw new Error('Insufficient balance');
      }

      // Get recipient's current balance
      const { data: recipientBalance, error: recipientError } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', recipientId)
        .single();

      if (recipientError) throw recipientError;

      // Create transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          amount,
          description,
          status: 'completed',
        });

      if (transactionError) throw transactionError;

      // Update sender's balance
      const { error: updateSenderError } = await supabase
        .from('balances')
        .update({ amount: Number(senderBalance.amount) - amount })
        .eq('user_id', user.id);

      if (updateSenderError) throw updateSenderError;

      // Update recipient's balance
      const { error: updateRecipientError } = await supabase
        .from('balances')
        .update({ amount: Number(recipientBalance.amount) + amount })
        .eq('user_id', recipientId);

      if (updateRecipientError) throw updateRecipientError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Money sent successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send money');
    },
  });
}
