import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CardTransaction {
  id: string;
  user_id: string;
  card_id: string;
  merchant_name: string;
  merchant_category: string | null;
  amount: number;
  currency: string;
  status: string;
  transaction_type: string;
  created_at: string;
}

export function useCardTransactions(cardId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cardTransactions', user?.id, cardId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('card_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cardId) {
        query = query.eq('card_id', cardId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching card transactions:', error);
        throw error;
      }
      return data as CardTransaction[];
    },
    enabled: !!user,
  });
}
