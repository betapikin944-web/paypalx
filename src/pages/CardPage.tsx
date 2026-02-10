import { useState } from "react";
import { motion } from "framer-motion";
import { CashCard } from "@/components/CashCard";
import { BottomNav } from "@/components/BottomNav";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Snowflake, 
  CreditCard, 
  Plus, 
  ArrowUpDown,
  Unlock,
  Flame,
  Package,
  History,
  Loader2
} from "lucide-react";
import { useCard } from "@/hooks/useCard";
import { useBalance } from "@/hooks/useBalance";
import { useCardBalance } from "@/hooks/useCardBalance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PhysicalCardRequestDialog } from "@/components/card/PhysicalCardRequestDialog";
import { CardTransactionList } from "@/components/card/CardTransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export default function CardPage() {
  const { card, isLoading, createCard, isCreating, toggleLock, toggleFreeze } = useCard();
  const { data: mainBalance } = useBalance();
  const { data: cardBalance } = useCardBalance(card?.id);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPhysicalCardDialog, setShowPhysicalCardDialog] = useState(false);
  const [showAddCashDialog, setShowAddCashDialog] = useState(false);
  const [showCashOutDialog, setShowCashOutDialog] = useState(false);
  const [cardHolderName, setCardHolderName] = useState('');
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mainAmount = mainBalance?.amount ? Number(mainBalance.amount) : 0;
  const cardAmount = cardBalance?.amount ? Number(cardBalance.amount) : 0;

  const handleCreateCard = () => {
    if (!cardHolderName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name as it should appear on the card.",
        variant: "destructive",
      });
      return;
    }
    createCard(cardHolderName.trim());
    setShowCreateDialog(false);
    setCardHolderName('');
  };

  const handleAddCash = async () => {
    if (!user || !card || !cashAmount) return;
    
    const amount = parseFloat(cashAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (amount > mainAmount) {
      toast({
        title: "Insufficient main balance",
        description: "You can only add cash up to your main balance.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc("card_add_cash", {
        _card_id: card.id,
        _amount: amount,
      });
      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data;

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["cardBalance"] });
      queryClient.invalidateQueries({ queryKey: ["cardTransactions"] });

      toast({
        title: "Cash added",
        description: `$${amount.toFixed(2)} moved to your Cash Card.`,
      });
      setShowAddCashDialog(false);
      setCashAmount("");
    } catch (error: any) {
      console.error("Error adding cash:", error);
      toast({
        title: "Failed to add cash",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOut = async () => {
    if (!user || !card || !cashAmount) return;
    
    const amount = parseFloat(cashAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (amount > cardAmount) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough card balance to cash out this amount.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc("card_cash_out", {
        _card_id: card.id,
        _amount: amount,
      });
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["cardBalance"] });
      queryClient.invalidateQueries({ queryKey: ["cardTransactions"] });
      
      toast({
        title: "Cash out successful",
        description: `$${amount.toFixed(2)} moved back to your main balance.`,
      });
      setShowCashOutDialog(false);
      setCashAmount('');
    } catch (error: any) {
      console.error('Error cashing out:', error);
      toast({
        title: "Failed to cash out",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cardActions = [
    { 
      icon: card?.is_locked ? Unlock : Lock, 
      label: card?.is_locked ? "Unlock Card" : "Lock Card",
      onClick: () => toggleLock(),
      disabled: !card
    },
    { 
      icon: Eye, 
      label: "Show Details",
      onClick: () => setShowDetailsDialog(true),
      disabled: !card
    },
    { 
      icon: card?.is_frozen ? Flame : Snowflake, 
      label: card?.is_frozen ? "Unfreeze" : "Freeze",
      onClick: () => toggleFreeze(),
      disabled: !card
    },
    { 
      icon: Package, 
      label: "Get Physical",
      onClick: () => setShowPhysicalCardDialog(true),
      disabled: !card
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // No card - show creation prompt
  if (!card) {
    return (
      <div className="min-h-screen pb-24 bg-background">
        <div className="p-4">
          <h1 className="text-base font-bold text-foreground">Cash Card</h1>
          <p className="text-muted-foreground text-[10px]">Get your virtual card</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 p-8 rounded-2xl bg-card border border-border text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-sm font-bold text-foreground mb-1">Create Your Cash Card</h2>
          <p className="text-[11px] text-muted-foreground mb-4">
            Get a virtual debit card linked to your PayPal balance. Use it anywhere Visa is accepted.
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full h-14 bg-primary hover:bg-primary-light text-primary-foreground rounded-full text-lg font-semibold"
          >
            Get Your Card
          </Button>
        </motion.div>

        {/* Create Card Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Your Cash Card</DialogTitle>
              <DialogDescription>
                Enter your name as you want it to appear on your card.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name on Card</label>
                <Input
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value.toUpperCase())}
                  placeholder="JOHN DOE"
                  className="h-12 rounded-xl uppercase"
                  maxLength={26}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This name will be displayed on your virtual card
                </p>
              </div>
              <Button
                onClick={handleCreateCard}
                disabled={isCreating}
                className="w-full h-12 bg-primary hover:bg-primary-light text-primary-foreground rounded-full font-semibold"
              >
                {isCreating ? 'Creating...' : 'Create Card'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="p-4 pb-2">
        <h1 className="text-base font-semibold text-foreground">Finances</h1>
      </div>

      {/* PayPal Balance Display */}
      <div className="mx-4 mb-3 p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <path
                d="M8 22V6h8c5 0 9 3 9 7.5S21 21 16 21h-4v1H8z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              ${mainAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground">PayPal balance</p>
          </div>
        </div>
      </div>

      {/* Card Display with activity link */}
      <div className="px-4 mb-2 relative">
        <CashCard 
          lastFour={card.last_four} 
          cardHolder={card.card_holder_name} 
        />
        {(card.is_locked || card.is_frozen) && (
          <div className="absolute inset-4 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center">
              {card.is_locked && (
                <div className="flex items-center gap-2 text-destructive">
                  <Lock className="w-6 h-6" />
                  <span className="font-semibold">Card Locked</span>
                </div>
              )}
              {card.is_frozen && !card.is_locked && (
                <div className="flex items-center gap-2 text-primary">
                  <Snowflake className="w-6 h-6" />
                  <span className="font-semibold">Card Frozen</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* See card activity row */}
      <div className="mx-4 mb-4 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">See card activity</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const tabsTrigger = document.querySelector('[data-value="history"]') as HTMLElement;
            tabsTrigger?.click();
          }}
          className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Card Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 p-4 rounded-xl bg-card border border-border mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-muted-foreground">Card Balance</span>
          <span className="text-lg font-bold text-foreground">
            ${cardAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddCashDialog(true)}
            className="flex-1 h-9 rounded-lg gradient-primary font-medium text-xs text-primary-foreground flex items-center justify-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Cash
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCashOutDialog(true)}
            className="flex-1 h-9 rounded-lg bg-muted font-medium text-xs flex items-center justify-center gap-1.5 text-foreground"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Cash Out
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs for Settings and Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-4"
      >
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="settings" className="flex-1">
              <CreditCard className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1">
              <History className="w-4 h-4 mr-2" />
              Purchases
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <div className="grid grid-cols-2 gap-3">
              {cardActions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="p-3 rounded-xl bg-card border border-border flex items-center gap-2.5 hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <action.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-left">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <CardTransactionList cardId={card.id} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Show Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Card Details</DialogTitle>
            <DialogDescription>
              Your virtual card information. Keep this secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Card Number</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg text-foreground">
                  {showCardNumber 
                    ? card.card_number.replace(/(.{4})/g, '$1 ').trim()
                    : `•••• •••• •••• ${card.last_four}`
                  }
                </p>
                <button onClick={() => setShowCardNumber(!showCardNumber)}>
                  {showCardNumber ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-xs text-muted-foreground mb-1">Expiry Date</p>
                <p className="font-mono text-lg text-foreground">
                  {card.expiry_month}/{card.expiry_year.slice(-2)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <p className="text-xs text-muted-foreground mb-1">CVV</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-lg text-foreground">
                    {showCvv ? card.cvv : '•••'}
                  </p>
                  <button onClick={() => setShowCvv(!showCvv)}>
                    {showCvv ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Card Holder</p>
              <p className="font-semibold text-foreground">{card.card_holder_name}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Physical Card Request Dialog */}
      <PhysicalCardRequestDialog
        open={showPhysicalCardDialog}
        onOpenChange={setShowPhysicalCardDialog}
        cardId={card.id}
        cardHolderName={card.card_holder_name}
      />

      {/* Add Cash Dialog */}
      <Dialog open={showAddCashDialog} onOpenChange={setShowAddCashDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Cash</DialogTitle>
            <DialogDescription>
              Add funds to your Cash Card balance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-foreground">
                ${mainAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Card Balance</p>
              <p className="text-2xl font-bold text-foreground">${cardAmount.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount to Add</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 pl-10 text-xl rounded-xl"
                  min="0"
                  max={mainAmount}
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCashDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCash} disabled={isProcessing || !cashAmount}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Cash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cash Out Dialog */}
      <Dialog open={showCashOutDialog} onOpenChange={setShowCashOutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cash Out</DialogTitle>
            <DialogDescription>
              Withdraw funds from your Cash Card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-muted">
              <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-foreground">
                ${cardAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount to Withdraw</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 pl-10 text-xl rounded-xl"
                  min="0"
                  max={cardAmount}
                  step="0.01"
                />
              </div>
              {parseFloat(cashAmount) > cardAmount && (
                <p className="text-sm text-destructive mt-1">
                  Insufficient balance
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCashOutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCashOut} 
              disabled={isProcessing || !cashAmount || parseFloat(cashAmount) > cardAmount}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cash Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
