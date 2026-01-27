import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserCard {
  id: string;
  user_id: string;
  card_holder_name: string;
  last_four: string;
  card_number: string;
  cvv: string;
  expiry_month: string;
  expiry_year: string;
  is_locked: boolean;
  is_frozen: boolean;
  created_at: string;
  updated_at: string;
}

export function useCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const cardQuery = useQuery({
    queryKey: ['userCard', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_cards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching card:', error);
        throw error;
      }
      return data as UserCard | null;
    },
    enabled: !!user,
  });

  const createCardMutation = useMutation({
    mutationFn: async (cardHolderName: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_cards')
        .insert({
          user_id: user.id,
          card_holder_name: cardHolderName.toUpperCase(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCard', user?.id] });
      toast({
        title: "Card created!",
        description: "Your virtual Cash Card is ready to use.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: async () => {
      if (!user || !cardQuery.data) throw new Error('No card found');

      const { error } = await supabase
        .from('user_cards')
        .update({ is_locked: !cardQuery.data.is_locked })
        .eq('user_id', user.id);

      if (error) throw error;
      return !cardQuery.data.is_locked;
    },
    onSuccess: (isLocked) => {
      queryClient.invalidateQueries({ queryKey: ['userCard', user?.id] });
      toast({
        title: isLocked ? "Card locked" : "Card unlocked",
        description: isLocked 
          ? "Your card is now locked and cannot be used."
          : "Your card is now unlocked and ready to use.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFreezeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !cardQuery.data) throw new Error('No card found');

      const { error } = await supabase
        .from('user_cards')
        .update({ is_frozen: !cardQuery.data.is_frozen })
        .eq('user_id', user.id);

      if (error) throw error;
      return !cardQuery.data.is_frozen;
    },
    onSuccess: (isFrozen) => {
      queryClient.invalidateQueries({ queryKey: ['userCard', user?.id] });
      toast({
        title: isFrozen ? "Card frozen" : "Card unfrozen",
        description: isFrozen 
          ? "Your card is temporarily frozen."
          : "Your card is now active again.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    card: cardQuery.data,
    isLoading: cardQuery.isLoading,
    createCard: createCardMutation.mutate,
    isCreating: createCardMutation.isPending,
    toggleLock: toggleLockMutation.mutate,
    isTogglingLock: toggleLockMutation.isPending,
    toggleFreeze: toggleFreezeMutation.mutate,
    isTogglingFreeze: toggleFreezeMutation.isPending,
  };
}
