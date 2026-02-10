import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { sendTransactionEmail } from '@/lib/emailjs';
import { format } from 'date-fns';

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
    email: string | null;
  } | null;
  recipient_profile?: {
    display_name: string | null;
    avatar_url: string | null;
    email: string | null;
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
        .select('user_id, display_name, avatar_url, email')
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
      description,
      senderCurrency,
      recipientCurrency,
    }: { 
      recipientId: string; 
      amount: number; 
      description?: string;
      senderCurrency?: string;
      recipientCurrency?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Get sender and recipient profiles for email alerts
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('user_id', user.id)
        .single();

      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('user_id', recipientId)
        .single();

      // Use edge function for currency-aware transfer
      const { data, error: transferError } = await supabase.functions.invoke('transfer-with-conversion', {
        body: {
          recipientId,
          amount,
          description: description || null,
          senderCurrency: senderCurrency || 'USD',
          recipientCurrency: recipientCurrency || 'USD',
        },
      });

      if (transferError) {
        throw new Error(transferError.message || 'Transfer failed');
      }

      if (data?.error) {
        if (data.error.includes('Insufficient balance')) {
          throw new Error('Insufficient balance');
        }
        throw new Error(data.error);
      }

      const transactionId = data?.transactionId;

      // Get the created transaction for email
      const { data: newTransaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      // Send email alerts via Resend edge function (non-blocking)
      const transactionDate = format(new Date(), 'MMM d, yyyy h:mm a');
      const receiptUrl = `${window.location.origin}/activity`;
      
      console.log('📧 Transaction complete, sending emails via Resend...');
      
      // Email to sender
      if (senderProfile?.email && newTransaction) {
        sendTransactionEmail({
          to_email: senderProfile.email,
          amount: amount.toFixed(2),
          sender_name: senderProfile.display_name || 'User',
          sender_email: senderProfile.email,
          receiver_name: recipientProfile?.display_name || 'User',
          receiver_email: recipientProfile?.email || '',
          transaction_id: newTransaction.id,
          date_time: transactionDate,
          receipt_url: receiptUrl,
          is_sender: true,
        }).catch(console.error);
      }

      // Email to recipient
      if (recipientProfile?.email && newTransaction) {
        sendTransactionEmail({
          to_email: recipientProfile.email,
          amount: amount.toFixed(2),
          sender_name: senderProfile?.display_name || 'User',
          sender_email: senderProfile?.email || '',
          receiver_name: recipientProfile.display_name || 'User',
          receiver_email: recipientProfile.email,
          transaction_id: newTransaction.id,
          date_time: transactionDate,
          receipt_url: receiptUrl,
          is_sender: false,
        }).catch(console.error);
      }

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
