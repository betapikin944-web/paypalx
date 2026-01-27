import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PhysicalCardRequest {
  id: string;
  user_id: string;
  card_id: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  status: string;
  requested_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestPhysicalCardData {
  card_id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

export function usePhysicalCardRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const requestsQuery = useQuery({
    queryKey: ['physicalCardRequests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('physical_card_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching physical card requests:', error);
        throw error;
      }
      return data as PhysicalCardRequest[];
    },
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestPhysicalCardData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('physical_card_requests')
        .insert({
          user_id: user.id,
          card_id: data.card_id,
          full_name: data.full_name,
          address_line1: data.address_line1,
          address_line2: data.address_line2 || null,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country || 'United States',
        })
        .select()
        .single();

      if (error) throw error;
      return result as PhysicalCardRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['physicalCardRequests', user?.id] });
      toast({
        title: "Request submitted!",
        description: "Your physical card request has been submitted. We'll notify you when it ships.",
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

  // Get the most recent request
  const latestRequest = requestsQuery.data?.[0] || null;
  const hasPendingRequest = latestRequest?.status === 'pending' || latestRequest?.status === 'processing' || latestRequest?.status === 'shipped';

  return {
    requests: requestsQuery.data || [],
    latestRequest,
    hasPendingRequest,
    isLoading: requestsQuery.isLoading,
    requestPhysicalCard: createRequestMutation.mutate,
    isRequesting: createRequestMutation.isPending,
  };
}
