import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupportContact {
  id: string;
  contact_type: 'email' | 'phone' | 'chat';
  label: string;
  value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSupportContacts() {
  return useQuery({
    queryKey: ['supportContacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_contacts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SupportContact[];
    },
  });
}

export function useAllSupportContacts() {
  return useQuery({
    queryKey: ['allSupportContacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_contacts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as SupportContact[];
    },
  });
}

export function useAddSupportContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: { contact_type: string; label: string; value: string }) => {
      const { data, error } = await supabase
        .from('support_contacts')
        .insert(contact)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportContacts'] });
      queryClient.invalidateQueries({ queryKey: ['allSupportContacts'] });
      toast.success('Support contact added');
    },
    onError: (error) => {
      toast.error('Failed to add contact: ' + error.message);
    },
  });
}

export function useUpdateSupportContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; label?: string; value?: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('support_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportContacts'] });
      queryClient.invalidateQueries({ queryKey: ['allSupportContacts'] });
      toast.success('Support contact updated');
    },
    onError: (error) => {
      toast.error('Failed to update contact: ' + error.message);
    },
  });
}

export function useDeleteSupportContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('support_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportContacts'] });
      queryClient.invalidateQueries({ queryKey: ['allSupportContacts'] });
      toast.success('Support contact deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete contact: ' + error.message);
    },
  });
}
