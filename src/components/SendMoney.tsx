import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, Loader2, Lock, AlertTriangle, Clock, Star, StarOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSearchProfiles, Profile } from "@/hooks/useProfile";
import { useSendMoney } from "@/hooks/useTransactions";
import { useBalance } from "@/hooks/useBalance";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "./Receipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { toast } from "sonner";
import { useRecentBeneficiaries, useSavedBeneficiaries, useSaveBeneficiary, useRemoveBeneficiary } from "@/hooks/useBeneficiaries";

export function SendMoney() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null);
  const [step, setStep] = useState<"select" | "amount" | "confirm" | "pin" | "success">("select");
  const [isSending, setIsSending] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  
  // Restriction and PIN state
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionMessage, setRestrictionMessage] = useState("");
  const [requiresPin, setRequiresPin] = useState(false);
  const [userPin, setUserPin] = useState("");
  const [enteredPin, setEnteredPin] = useState("");
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchProfiles(searchTerm);
  const { data: balance } = useBalance();
  const { data: recentBeneficiaries, isLoading: beneficiariesLoading } = useRecentBeneficiaries();
  const { data: savedBeneficiaries } = useSavedBeneficiaries();
  const saveBeneficiary = useSaveBeneficiary();
  const removeBeneficiary = useRemoveBeneficiary();
  const sendMoney = useSendMoney();

  const isSaved = (userId: string) => savedBeneficiaries?.some(b => b.beneficiary_user_id === userId) ?? false;

  const toggleFavorite = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (isSaved(userId)) {
      removeBeneficiary.mutate(userId);
    } else {
      saveBeneficiary.mutate(userId);
    }
  };

  // Check user restrictions on mount
  useEffect(() => {
    const checkRestrictions = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_suspended, is_transfer_restricted, transfer_restriction_message, transfer_pin')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        if ((profile as any).is_suspended) {
          setIsRestricted(true);
          setRestrictionMessage("Your account has been suspended. Please contact support.");
          setShowRestrictionModal(true);
        } else if ((profile as any).is_transfer_restricted) {
          setIsRestricted(true);
          setRestrictionMessage((profile as any).transfer_restriction_message || "Your transfers have been restricted. Please contact support.");
          setShowRestrictionModal(true);
        }
        if ((profile as any).transfer_pin) {
          setRequiresPin(true);
          setUserPin((profile as any).transfer_pin);
        }
      }
    };

    checkRestrictions();
  }, [user]);

  const handleNumberPress = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleContactSelect = (contact: Profile) => {
    setSelectedContact(contact);
    setStep("amount");
  };

  const handlePay = async () => {
    if (!selectedContact || !amount) return;
    
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) return;

    // Show confirmation step first
    if (step === "amount") {
      setStep("confirm");
      return;
    }

    // Check if PIN is required
    if (requiresPin && step === "confirm") {
      setStep("pin");
      return;
    }
    
    setIsSending(true);
    try {
      await sendMoney.mutateAsync({
        recipientId: selectedContact.user_id,
        amount: amountNum,
        description: `Payment to ${selectedContact.display_name || selectedContact.email || 'user'}`,
      });

      // Create receipt data
      setCompletedTransaction({
        id: crypto.randomUUID(),
        amount: amountNum,
        currency: "USD",
        description: `Payment to ${selectedContact.display_name || selectedContact.email || 'user'}`,
        created_at: new Date().toISOString(),
        status: "completed",
        recipientName: selectedContact.display_name || selectedContact.email?.split('@')[0],
        recipientEmail: selectedContact.email,
      });
      setStep("success");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSending(false);
    }
  };

  const handlePinSubmit = () => {
    if (enteredPin !== userPin) {
      toast.error("Incorrect PIN. Please try again.");
      setEnteredPin("");
      return;
    }
    handlePay();
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleCloseReceipt = () => {
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Restriction Modal */}
      <Dialog open={showRestrictionModal} onOpenChange={setShowRestrictionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Transfer Restricted
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">{restrictionMessage}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => navigate('/')}>
              Go Back
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-primary text-primary-foreground">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (step === "pin") setStep("confirm");
            else if (step === "confirm") setStep("amount");
            else if (step === "amount") setStep("select");
            else navigate("/");
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">
          {step === "select" ? "Send Money" : step === "pin" ? "Enter PIN" : step === "confirm" ? "Confirm Payment" : `To ${selectedContact?.display_name || selectedContact?.email?.split('@')[0] || 'User'}`}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Search */}
            <div className="px-4 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter email address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-muted border-0 rounded-2xl text-base"
                  disabled={isRestricted}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Search by email, name, or phone number
              </p>
            </div>

            {/* Saved Favorites */}
            {!searchTerm && savedBeneficiaries && savedBeneficiaries.length > 0 && (
              <div className="px-4 mb-4">
                <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Favorites
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {savedBeneficiaries.map((b, index) => (
                    <motion.button
                      key={b.beneficiary_user_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleContactSelect({
                          id: b.beneficiary_user_id,
                          user_id: b.beneficiary_user_id,
                          display_name: b.profile?.display_name || null,
                          email: b.profile?.email || null,
                          avatar_url: b.profile?.avatar_url || null,
                          phone_number: null,
                          created_at: '',
                          updated_at: '',
                          is_suspended: null,
                          is_transfer_restricted: null,
                          suspension_reason: null,
                          transfer_pin: null,
                          transfer_restriction_message: null,
                        } as Profile)
                      }
                      disabled={isRestricted}
                      className="flex flex-col items-center gap-1.5 min-w-[64px] disabled:opacity-50 relative"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          {b.profile?.avatar_url ? (
                            <img src={b.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary-foreground">
                              {getInitials(b.profile?.display_name || null, b.profile?.email || null)}
                            </span>
                          )}
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
                          <Star className="h-2.5 w-2.5 text-warning-foreground fill-current" />
                        </div>
                      </div>
                      <span className="text-[11px] text-foreground font-medium truncate max-w-[64px]">
                        {b.profile?.display_name || b.profile?.email?.split('@')[0] || 'User'}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Beneficiaries */}
            {!searchTerm && recentBeneficiaries && recentBeneficiaries.length > 0 && (
              <div className="px-4 mb-4">
                <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Recent
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                  {recentBeneficiaries.map((b, index) => (
                    <motion.button
                      key={b.user_id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        handleContactSelect({
                          id: b.user_id,
                          user_id: b.user_id,
                          display_name: b.display_name,
                          email: b.email,
                          avatar_url: b.avatar_url,
                          phone_number: null,
                          created_at: '',
                          updated_at: '',
                          is_suspended: null,
                          is_transfer_restricted: null,
                          suspension_reason: null,
                          transfer_pin: null,
                          transfer_restriction_message: null,
                        } as Profile)
                      }
                      disabled={isRestricted}
                      className="flex flex-col items-center gap-1.5 min-w-[64px] disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        {b.avatar_url ? (
                          <img src={b.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary-foreground">
                            {getInitials(b.display_name, b.email)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-foreground font-medium truncate max-w-[64px]">
                        {b.display_name || b.email?.split('@')[0] || 'User'}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            <div className="px-4 flex-1">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Results</h2>
                  <div className="space-y-2">
                    {searchResults.map((profile, index) => (
                      <motion.button
                        key={profile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContactSelect(profile)}
                        disabled={isRestricted}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all disabled:opacity-50"
                      >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-base font-bold text-primary-foreground">
                              {getInitials(profile.display_name, profile.email)}
                            </span>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-foreground">{profile.display_name || profile.email?.split('@')[0] || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{profile.email || profile.phone_number || 'No contact info'}</p>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(e, profile.user_id)}
                          className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                          {isSaved(profile.user_id) ? (
                            <Star className="h-5 w-5 text-warning fill-current" />
                          ) : (
                            <Star className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : searchTerm.length >= 2 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No users found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                </motion.div>
              ) : !recentBeneficiaries?.length && !savedBeneficiaries?.length ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">Find someone to pay</p>
                  <p className="text-sm text-muted-foreground mt-1">Enter their email or name above</p>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        ) : step === "amount" ? (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Recipient Info */}
            <div className="px-4 py-6 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {getInitials(selectedContact?.display_name || null, selectedContact?.email || null)}
                </span>
              </div>
              <div>
                <p className="font-semibold">{selectedContact?.display_name || selectedContact?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-muted-foreground">{selectedContact?.email}</p>
              </div>
            </div>

            {/* Amount Display */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold mb-2 text-foreground"
              >
                ${amount || "0"}
              </motion.div>
              {balance && (
                <p className="text-sm text-muted-foreground mt-2">
                  Available balance: <span className="font-semibold">${Number(balance.amount).toFixed(2)}</span>
                </p>
              )}
              {balance && parseFloat(amount) > Number(balance.amount) && (
                <p className="text-sm text-destructive mt-1">
                  Insufficient balance
                </p>
              )}
              {requiresPin && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> PIN required for this transfer
                </p>
              )}
            </div>

            {/* Numpad */}
            <div className="p-4 pb-8 bg-muted/30">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNumberPress(num)}
                    className="h-16 rounded-2xl bg-card text-2xl font-semibold hover:bg-muted transition-colors border border-border"
                  >
                    {num}
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="h-16 rounded-2xl bg-card hover:bg-muted transition-colors flex items-center justify-center border border-border"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
              <Button
                disabled={!amount || parseFloat(amount) === 0 || parseFloat(amount) > Number(balance?.amount || 0)}
                onClick={handlePay}
                className="w-full h-14 text-lg font-semibold rounded-full"
              >
                {`Send $${amount || "0"}`}
              </Button>
            </div>
          </motion.div>
        ) : step === "confirm" ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            {isSending ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
                <p className="text-lg font-semibold text-foreground">Sending payment...</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your transfer</p>
              </motion.div>
            ) : (
              <>
                {/* Confirmation Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-sm mb-6"
                >
                  <div className="text-center mb-5">
                    <p className="text-sm text-muted-foreground mb-1">You are sending</p>
                    <p className="text-4xl font-bold text-foreground">${parseFloat(amount).toFixed(2)}</p>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary-foreground">
                          {getInitials(selectedContact?.display_name || null, selectedContact?.email || null)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">To</p>
                        <p className="font-semibold text-foreground truncate">
                          {selectedContact?.display_name || selectedContact?.email?.split('@')[0] || 'User'}
                        </p>
                        {selectedContact?.email && (
                          <p className="text-xs text-muted-foreground truncate">{selectedContact.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border mt-4 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-foreground">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-medium text-[#00A651]">Free</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2 pt-2 border-t border-border">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-foreground">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs text-muted-foreground text-center mb-6 px-4"
                >
                  Please review the details above before confirming. This action cannot be undone.
                </motion.p>

                <div className="w-full max-w-sm space-y-3">
                  <Button
                    onClick={handlePay}
                    disabled={sendMoney.isPending}
                    className="w-full h-14 text-lg font-semibold rounded-full"
                  >
                    Confirm & Send ${parseFloat(amount).toFixed(2)}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setStep("amount")}
                    className="w-full h-12 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        ) : step === "pin" ? (
          <motion.div
            key="pin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col items-center justify-center p-6"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Lock className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Enter Transfer PIN</h2>
            <p className="text-muted-foreground text-center mb-6">
              Enter your PIN to confirm sending ${amount} to {selectedContact?.display_name || selectedContact?.email?.split('@')[0]}
            </p>
            <Input
              type="password"
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter PIN"
              className="text-center text-2xl tracking-widest max-w-[200px] mb-6"
              maxLength={6}
            />
            <Button
              onClick={handlePinSubmit}
              disabled={enteredPin.length < 4 || sendMoney.isPending}
              className="w-full max-w-[200px] h-14 rounded-full"
            >
              {sendMoney.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {step === "success" && completedTransaction && (
          <Receipt
            transaction={completedTransaction}
            type="sent"
            onClose={handleCloseReceipt}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}