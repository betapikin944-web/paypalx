import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateWithdrawal } from "@/hooks/useWithdrawals";
import { useBalance } from "@/hooks/useBalance";
import { Building2, AlertCircle } from "lucide-react";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawalDialog({ open, onOpenChange }: WithdrawalDialogProps) {
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const { data: balance } = useBalance();
  const createWithdrawal = useCreateWithdrawal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    if (balance && numAmount > balance.amount) {
      return;
    }

    await createWithdrawal.mutateAsync({
      amount: numAmount,
      bankName,
      accountNumber,
      routingNumber,
      accountHolderName,
    });

    // Reset form and close
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setRoutingNumber("");
    setAccountHolderName("");
    onOpenChange(false);
  };

  const availableBalance = balance?.amount || 0;
  const numAmount = parseFloat(amount) || 0;
  const isInsufficientFunds = numAmount > availableBalance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Transfer to Bank
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available Balance */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-lg font-semibold">
              ${availableBalance.toFixed(2)}
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Withdraw</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                required
              />
            </div>
            {isInsufficientFunds && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Insufficient funds
              </p>
            )}
          </div>

          {/* Bank Details */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="e.g. Chase Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountHolderName">Account Holder Name</Label>
            <Input
              id="accountHolderName"
              placeholder="John Doe"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input
                id="routingNumber"
                placeholder="021000021"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createWithdrawal.isPending || isInsufficientFunds || numAmount <= 0}
              className="flex-1"
            >
              {createWithdrawal.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Withdrawal requests are typically processed within 1-3 business days
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
