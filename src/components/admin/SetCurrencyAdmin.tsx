import { useState } from 'react';
import { Search, Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SUPPORTED_CURRENCIES, getCurrencySymbol } from '@/lib/currencies';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SetCurrencyAdminProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
}

export function SetCurrencyAdmin({ open, onOpenChange, selectedUser }: SetCurrencyAdminProps) {
  const queryClient = useQueryClient();
  const [currency, setCurrency] = useState(selectedUser?.preferred_currency || 'USD');
  const [currencySearch, setCurrencySearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredCurrencies = SUPPORTED_CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: currency })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;

      // Also update the balance currency column
      const { error: balError } = await supabase
        .from('balances')
        .update({ currency })
        .eq('user_id', selectedUser.user_id);

      if (balError) throw balError;

      toast.success(`Currency set to ${currency} for ${selectedUser.display_name || selectedUser.email}`);
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to set currency: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Set User Currency
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
                  Current: {selectedUser.preferred_currency || 'USD'}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Currency</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search currencies..."
                value={currencySearch}
                onChange={(e) => setCurrencySearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-lg">
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : (
              `Set to ${currency}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
