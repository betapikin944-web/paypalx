import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Beneficiary {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  last_transacted_at: string;
}

export function useRecentBeneficiaries() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['recent-beneficiaries', user?.id],
    queryFn: async (): Promise<Beneficiary[]> => {
      if (!user) return [];

      // Get recent unique recipients from transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('recipient_id, created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (!transactions || transactions.length === 0) return [];

      // Get unique recipient IDs preserving order (most recent first)
      const seen = new Set<string>();
      const uniqueRecipientIds: string[] = [];
      for (const t of transactions) {
        if (t.recipient_id && !seen.has(t.recipient_id)) {
          seen.add(t.recipient_id);
          uniqueRecipientIds.push(t.recipient_id);
        }
      }

      if (uniqueRecipientIds.length === 0) return [];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url')
        .in('user_id', uniqueRecipientIds);

      if (!profiles) return [];

      const profileMap = new Map(profiles.map(p => [p.user_id, p]));

      // Build beneficiary list in order of recency
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
