import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Beneficiary {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  last_transacted_at: string;
}

export interface SavedBeneficiary {
  id: string;
  user_id: string;
  beneficiary_user_id: string;
  nickname: string | null;
  created_at: string;
  profile?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export function useRecentBeneficiaries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-beneficiaries', user?.id],
    queryFn: async (): Promise<Beneficiary[]> => {
      if (!user) return [];

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('recipient_id, created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!transactions || transactions.length === 0) return [];

      const seen = new Set<string>();
      const uniqueRecipientIds: string[] = [];
      for (const t of transactions) {
        if (t.recipient_id && !seen.has(t.recipient_id)) {
          seen.add(t.recipient_id);
          uniqueRecipientIds.push(t.recipient_id);
        }
      }

      if (uniqueRecipientIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', uniqueRecipientIds);

      if (!profiles) return [];

      const profileMap = new Map(profiles.map(p => [p.user_id, p]));

      const lastTransactionMap = new Map<string, string>();
      for (const t of transactions) {
        if (t.recipient_id && !lastTransactionMap.has(t.recipient_id)) {
          lastTransactionMap.set(t.recipient_id, t.created_at);
        }
      }

      return uniqueRecipientIds
        .filter(id => profileMap.has(id))
        .slice(0, 10)
        .map(id => {
          const profile = profileMap.get(id)!;
          return {
            user_id: profile.user_id,
            display_name: profile.display_name,
            email: profile.email,
            avatar_url: profile.avatar_url,
            last_transacted_at: lastTransactionMap.get(id) || '',
          };
        });
    },
    enabled: !!user,
  });
}

export function useSavedBeneficiaries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved-beneficiaries', user?.id],
    queryFn: async (): Promise<SavedBeneficiary[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const beneficiaryIds = data.map(b => b.beneficiary_user_id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', beneficiaryIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return data.map(b => ({
        ...b,
        profile: profileMap.get(b.beneficiary_user_id) || undefined,
      }));
    },
    enabled: !!user,
  });
}

export function useSaveBeneficiary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (beneficiaryUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_beneficiaries')
        .insert({ user_id: user.id, beneficiary_user_id: beneficiaryUserId });

      if (error) {
        if (error.code === '23505') throw new Error('Already saved');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-beneficiaries'] });
      toast.success('Contact saved to favorites!');
    },
    onError: (error) => {
      if (error.message === 'Already saved') {
        toast.info('This contact is already in your favorites');
      } else {
        toast.error('Failed to save contact');
      }
    },
  });
}

export function useRemoveBeneficiary() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (beneficiaryUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('saved_beneficiaries')
        .delete()
        .eq('user_id', user.id)
        .eq('beneficiary_user_id', beneficiaryUserId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-beneficiaries'] });
      toast.success('Contact removed from favorites');
    },
    onError: () => {
      toast.error('Failed to remove contact');
    },
  });
}
