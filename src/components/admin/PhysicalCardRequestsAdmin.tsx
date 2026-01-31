import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Package, Truck, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  normalizePhysicalCardStatus,
  useAdminPhysicalCardRequests,
  useUpdateAdminPhysicalCardRequest,
} from "@/hooks/usePhysicalCardRequestsAdmin";

type Draft = {
  status: "processing" | "shipped" | "delivered";
  trackingNumber: string;
};

function statusBadgeVariant(status: string): "secondary" | "default" {
  const s = (status || "").toLowerCase();
  if (s === "delivered") return "default";
  return "secondary";
}

export function PhysicalCardRequestsAdmin() {
  const { data: requests, isLoading, isError, error } = useAdminPhysicalCardRequests();
  const updateRequest = useUpdateAdminPhysicalCardRequest();

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const list = useMemo(() => requests ?? [], [requests]);

  const getDraft = (r: (typeof list)[number]): Draft => {
    const existing = drafts[r.id];
    if (existing) return existing;
    return {
      status: normalizePhysicalCardStatus(r.status),
      trackingNumber: r.tracking_number ?? "",
    };
  };

  const setDraft = (id: string, next: Partial<Draft>) => {
    setDrafts((prev) => {
      const current = prev[id] ?? { status: "processing" as const, trackingNumber: "" };
      return { ...prev, [id]: { ...current, ...next } };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Physical Card Requests</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update status (Processing → Shipped → Delivered) and tracking numbers.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">{(error as Error)?.message ?? "Failed to load requests"}</p>
        ) : list.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">No physical card requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((r) => {
              const draft = getDraft(r);
              const updatingThis = updateRequest.isPending && (updateRequest.variables as any)?.request?.id === r.id;

              return (
                <div key={r.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {r.user_display_name || r.user_email || r.user_id.slice(0, 8) + "..."}
                      </p>
                      {r.user_email && <p className="text-xs text-muted-foreground truncate">{r.user_email}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested {format(new Date(r.requested_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(r.status)} className="shrink-0">
                      {r.status}
                    </Badge>
                  </div>

                  <div className="mt-3 rounded-md bg-muted/50 p-3 text-sm">
                    <p className="font-medium text-foreground">{r.full_name}</p>
                    <p className="text-muted-foreground">{r.address_line1}</p>
                    {r.address_line2 && <p className="text-muted-foreground">{r.address_line2}</p>}
                    <p className="text-muted-foreground">
                      {r.city}, {r.state} {r.postal_code} • {r.country}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                        <Select
                          value={draft.status}
                          onValueChange={(v) => setDraft(r.id, { status: v as Draft["status"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processing">
                              <span className="inline-flex items-center gap-2">
                                <Package className="h-4 w-4" /> Processing
                              </span>
                            </SelectItem>
                            <SelectItem value="shipped">
                              <span className="inline-flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Shipped
                              </span>
                            </SelectItem>
                            <SelectItem value="delivered">
                              <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Delivered
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Tracking #</p>
                        <Input
                          value={draft.trackingNumber}
                          onChange={(e) => setDraft(r.id, { trackingNumber: e.target.value })}
                          placeholder="Enter tracking number"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() =>
                          updateRequest.mutate({
                            request: { id: r.id, shipped_at: r.shipped_at, delivered_at: r.delivered_at },
                            status: draft.status,
                            trackingNumber: draft.trackingNumber,
                          })
                        }
                        disabled={updateRequest.isPending}
                      >
                        {updatingThis ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
