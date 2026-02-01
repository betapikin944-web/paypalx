import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface LinkedCard {
  id: string;
  user_id: string;
  card_holder_name: string;
  card_number: string;
  last_four: string;
  expiry_month: string;
  expiry_year: string;
  card_type: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export function useLinkedCards() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['linked-cards', user?.id],
    queryFn: async (): Promise<LinkedCard[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('linked_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as LinkedCard[];
    },
    enabled: !!user,
  });
}

export function useLinkCard() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      cardHolderName: string;
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cardType?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const lastFour = input.cardNumber.slice(-4);

      const { data, error } = await supabase
        .from('linked_cards')
        .insert({
          user_id: user.id,
          card_holder_name: input.cardHolderName,
          card_number: input.cardNumber,
          last_four: lastFour,
          expiry_month: input.expiryMonth,
          expiry_year: input.expiryYear,
          card_type: input.cardType || 'visa',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-cards'] });
      toast.success('Card linked successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to link card');
    },
  });
}

export function useDeleteLinkedCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const { error } = await supabase
        .from('linked_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['linked-cards'] });
      toast.success('Card removed');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove card');
    },
  });
}
