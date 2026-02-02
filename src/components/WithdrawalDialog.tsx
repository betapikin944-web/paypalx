import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWithdrawals, useCreateWithdrawal } from "@/hooks/useWithdrawals";
import { useBalance } from "@/hooks/useBalance";
import { Building2, AlertCircle, Plus, Check, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SavedBank {
  id: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_holder_name: string;
}

export function WithdrawalDialog({ open, onOpenChange }: WithdrawalDialogProps) {
  const [step, setStep] = useState<'select' | 'new' | 'amount'>('select');
  const [selectedBank, setSelectedBank] = useState<SavedBank | null>(null);
  
  // Form state for new bank
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  
  // Amount state
  const [amount, setAmount] = useState("");

  const { data: balance } = useBalance();
  const { data: withdrawals } = useWithdrawals();
  const createWithdrawal = useCreateWithdrawal();

  // Extract unique banks from previous withdrawals
  const savedBanks: SavedBank[] = [];
  const seenBanks = new Set<string>();
  
  withdrawals?.forEach(w => {
    const key = `${w.bank_name}-${w.account_number}-${w.routing_number}`;
    if (!seenBanks.has(key)) {
      seenBanks.add(key);
      savedBanks.push({
        id: w.id,
        bank_name: w.bank_name,
        account_number: w.account_number,
        routing_number: w.routing_number,
        account_holder_name: w.account_holder_name,
      });
    }
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep('select');
      setSelectedBank(null);
      setAmount("");
      setBankName("");
      setAccountNumber("");
      setRoutingNumber("");
      setAccountHolderName("");
    }
  }, [open]);

  const handleSelectBank = (bank: SavedBank) => {
    setSelectedBank(bank);
    setStep('amount');
  };

  const handleNewBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedBank({
      id: 'new',
      bank_name: bankName,
      account_number: accountNumber,
      routing_number: routingNumber,
      account_holder_name: accountHolderName,
    });
    setStep('amount');
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBank) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    if (balance && numAmount > balance.amount) {
      return;
    }

    await createWithdrawal.mutateAsync({
      amount: numAmount,
      bankName: selectedBank.bank_name,
      accountNumber: selectedBank.account_number,
      routingNumber: selectedBank.routing_number,
      accountHolderName: selectedBank.account_holder_name,
    });

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
            {step !== 'select' && (
              <button
                onClick={() => setStep(step === 'amount' ? (savedBanks.length > 0 ? 'select' : 'new') : 'select')}
                className="p-1 hover:bg-muted rounded"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Building2 className="h-5 w-5" />
            {step === 'select' && 'Withdraw to Bank'}
            {step === 'new' && 'Add Bank Account'}
            {step === 'amount' && 'Withdrawal Amount'}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Bank or Add New */}
        {step === 'select' && (
          <div className="space-y-4">
            {/* Available Balance */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-lg font-semibold">
                ${availableBalance.toFixed(2)}
              </p>
            </div>

            {/* Saved Banks */}
            {savedBanks.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Your Bank Accounts</p>
                {savedBanks.map((bank) => (
                  <Card
                    key={`${bank.bank_name}-${bank.account_number}`}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelectBank(bank)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{bank.bank_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {bank.account_holder_name} • ****{bank.account_number.slice(-4)}
                        </p>
                      </div>
                      <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add New Bank Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setStep('new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {savedBanks.length > 0 ? 'Use Different Bank' : 'Add Bank Account'}
            </Button>
          </div>
        )}

        {/* Step 2: New Bank Form */}
        {step === 'new' && (
          <form onSubmit={handleNewBankSubmit} className="space-y-4">
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

            <Button type="submit" className="w-full">
              Continue to Withdraw
            </Button>
          </form>
        )}

        {/* Step 3: Amount */}
        {step === 'amount' && selectedBank && (
          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* Selected Bank Info */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{selectedBank.bank_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBank.account_holder_name} • ****{selectedBank.account_number.slice(-4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Available Balance */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-lg font-semibold">
                ${availableBalance.toFixed(2)}
              </p>
            </div>

            {/* Amount Input */}
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
                {createWithdrawal.isPending ? "Processing..." : "Authorize Withdrawal"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Withdrawal requests are typically processed within 1-3 business days
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
