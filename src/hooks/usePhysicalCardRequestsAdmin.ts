import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";

export type PhysicalCardRequestStatus = "pending" | "processing" | "shipped" | "delivered";

export interface AdminPhysicalCardRequest {
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
  // hydrated fields
  user_display_name?: string | null;
  user_email?: string | null;
}

export function useAdminPhysicalCardRequests() {
  const { data: isAdmin, isSuccess: adminCheckComplete } = useIsAdmin();

  return useQuery({
    queryKey: ["admin", "physicalCardRequests"],
    enabled: adminCheckComplete && isAdmin === true,
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from("physical_card_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) throw error;

      const userIds = Array.from(new Set((requests ?? []).map((r) => r.user_id))).filter(Boolean);
      if (userIds.length === 0) return (requests ?? []) as AdminPhysicalCardRequest[];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const profileByUserId = new Map(
        (profiles ?? []).map((p) => [p.user_id, { display_name: p.display_name, email: p.email }]),
      );

      return (requests ?? []).map((r: any) => {
        const p = profileByUserId.get(r.user_id);
        return {
          ...(r as AdminPhysicalCardRequest),
          user_display_name: p?.display_name ?? null,
          user_email: p?.email ?? null,
        };
      }) as AdminPhysicalCardRequest[];
    },
  });
}

export function useUpdateAdminPhysicalCardRequest() {
  const queryClient = useQueryClient();
  const { data: isAdmin } = useIsAdmin();

  return useMutation({
    mutationFn: async (input: {
      request: Pick<AdminPhysicalCardRequest, "id" | "shipped_at" | "delivered_at">;
      status: "processing" | "shipped" | "delivered";
      trackingNumber?: string;
    }) => {
      if (!isAdmin) throw new Error("Not authorized");

      const now = new Date().toISOString();

      const updates: Record<string, any> = {
        status: input.status,
        tracking_number: input.trackingNumber?.trim() ? input.trackingNumber.trim() : null,
      };

      if (input.status === "shipped" && !input.request.shipped_at) {
        updates.shipped_at = now;
      }

      if (input.status === "delivered") {
        if (!input.request.shipped_at) updates.shipped_at = now;
        if (!input.request.delivered_at) updates.delivered_at = now;
      }

      const { data, error } = await supabase
        .from("physical_card_requests")
        .update(updates)
        .eq("id", input.request.id)
        .select("*")
        .single();

      if (error) throw error;
      return data as AdminPhysicalCardRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "physicalCardRequests"] });
      toast.success("Physical card request updated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function normalizePhysicalCardStatus(status: string): "processing" | "shipped" | "delivered" {
  const s = (status || "").toLowerCase();
  if (s === "shipped") return "shipped";
  if (s === "delivered") return "delivered";
  // treat "pending" and any unknown statuses as "processing" for the admin workflow
  return "processing";
}
