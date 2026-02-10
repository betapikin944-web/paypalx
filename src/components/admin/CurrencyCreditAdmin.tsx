import { useState } from 'react';
import { Search, DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '@/lib/currencies';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CurrencyCreditAdminProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
}

export function CurrencyCreditAdmin({ open, onOpenChange, selectedUser }: CurrencyCreditAdminProps) {
  const { user: adminUser } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('Admin deposit');
  const [currencySearch, setCurrencySearch] = useState('');
  const [isCrediting, setIsCrediting] = useState(false);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleCredit = async () => {
    if (!selectedUser || !adminUser) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsCrediting(true);
    try {
      // If crediting in user's preferred currency, add directly
      // Otherwise, convert first using edge function
      let finalAmount = amountNum;
      const userCurrency = selectedUser.preferred_currency || 'USD';

      if (currency !== userCurrency) {
        // Convert to user's preferred currency
        const { data, error } = await supabase.functions.invoke('get-exchange-rate', {
          body: { from: currency, to: userCurrency, amount: amountNum },
        });

        if (error) throw error;
        finalAmount = data.convertedAmount;
      }

      // Add to balance
      const newBalance = (selectedUser.balance || 0) + finalAmount;
      const { error: balanceError } = await supabase
        .from('balances')
        .update({ amount: newBalance })
        .eq('user_id', selectedUser.user_id);

      if (balanceError) throw balanceError;

      // Log transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          sender_id: adminUser.id,
          recipient_id: selectedUser.user_id,
          amount: finalAmount,
          description: `${description} (${getCurrencySymbol(currency)}${amountNum.toFixed(2)} ${currency}${currency !== userCurrency ? ` → ${getCurrencySymbol(userCurrency)}${finalAmount.toFixed(2)} ${userCurrency}` : ''})`,
          status: 'completed',
          currency: userCurrency,
        });

      if (txError) throw txError;

      toast.success(
        currency !== userCurrency
          ? `Credited ${getCurrencySymbol(currency)}${amountNum.toFixed(2)} ${currency} (${getCurrencySymbol(userCurrency)}${finalAmount.toFixed(2)} ${userCurrency}) to ${selectedUser.display_name || selectedUser.email}`
          : `Credited ${getCurrencySymbol(currency)}${amountNum.toFixed(2)} to ${selectedUser.display_name || selectedUser.email}`
      );

      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      queryClient.invalidateQueries({ queryKey: ['allTransactions'] });
      onOpenChange(false);
      setAmount('');
      setCurrency('USD');
      setDescription('Admin deposit');
    } catch (error: any) {
      toast.error('Failed to credit: ' + error.message);
    } finally {
      setIsCrediting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Credit Currency
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          {selectedUser && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedUser.display_name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{selectedUser.display_name || selectedUser.email || 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  Balance: {getCurrencySymbol(selectedUser.preferred_currency || 'USD')}
                  {selectedUser.balance?.toFixed(2)} ({selectedUser.preferred_currency || 'USD'})
                </p>
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Currency Picker */}
          <div className="space-y-2">
            <Label>Currency</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search currencies..."
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              {filteredCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCurrency(c.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-muted transition-colors ${
                    currency === c.code ? 'bg-primary/10 text-primary font-medium' : ''
                  }`}
                >
                  <span className="font-mono w-10">{c.code}</span>
                  <span className="text-muted-foreground">{c.symbol}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Admin deposit"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCredit} disabled={isCrediting || !amount}>
            {isCrediting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Credit ${getCurrencySymbol(currency)}${amount || '0'} ${currency}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
