import { useState } from "react";
import { useAllWithdrawals, useUpdateWithdrawal } from "@/hooks/useWithdrawals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, User, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function WithdrawalsAdmin() {
  const { data: withdrawals, isLoading } = useAllWithdrawals();
  const updateWithdrawal = useUpdateWithdrawal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!withdrawals || withdrawals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No withdrawal requests yet</p>
      </div>
    );
  }

  const handleEdit = (withdrawal: typeof withdrawals[0]) => {
    setEditingId(withdrawal.id);
    setStatus(withdrawal.status);
    setAdminNotes(withdrawal.admin_notes || "");
  };

  const handleSave = async () => {
    if (!editingId) return;

    const withdrawal = withdrawals?.find(w => w.id === editingId);
    const previousStatus = withdrawal?.status;

    await updateWithdrawal.mutateAsync({
      id: editingId,
      status,
      adminNotes,
    });

    // If changing to declined or failed from pending, refund the user
    if ((status === 'declined' || status === 'failed') && previousStatus === 'pending') {
      try {
        const { error } = await supabase.rpc('refund_withdrawal', {
          _withdrawal_id: editingId,
        });
        if (error) {
          toast.error('Status updated but refund failed: ' + error.message);
        } else {
          toast.success('Withdrawal declined and amount refunded');
        }
      } catch {
        toast.error('Refund processing failed');
      }
    }

    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "successful":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Withdrawal Requests ({withdrawals.length})</h3>
      
      <div className="grid gap-4">
        {withdrawals.map((withdrawal) => (
          <Card key={withdrawal.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  ${withdrawal.amount.toFixed(2)}
                </CardTitle>
                <Badge className={getStatusColor(withdrawal.status)}>
                  {withdrawal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {editingId === withdrawal.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="successful">Successful</SelectItem>
                        <SelectItem value="declined">Declined</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Admin Notes</Label>
                    <Input
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateWithdrawal.isPending}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">User</p>
                      <p className="font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {withdrawal.profile?.display_name || withdrawal.profile?.email || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bank</p>
                      <p className="font-medium">{withdrawal.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Holder</p>
                      <p className="font-medium">{withdrawal.account_holder_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Number</p>
                      <p className="font-mono text-xs">{withdrawal.account_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Routing Number</p>
                      <p className="font-mono text-xs">{withdrawal.routing_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Requested</p>
                      <p className="font-medium">
                        {format(new Date(withdrawal.created_at), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                  {withdrawal.admin_notes && (
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Notes:</strong> {withdrawal.admin_notes}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(withdrawal)}
                  >
                    Update Status
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
