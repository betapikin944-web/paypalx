import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Store, Loader2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSendMoney } from "@/hooks/useTransactions";
import { useBalance } from "@/hooks/useBalance";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "@/components/Receipt";

export default function PayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<"options" | "amount" | "confirm" | "success">("options");
  const [amount, setAmount] = useState("");
  const [prefilledRecipient, setPrefilledRecipient] = useState<any>(null);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);

  const { data: balance } = useBalance();
  const sendMoney = useSendMoney();

  useEffect(() => {
    const toEmail = searchParams.get('to');
    const requestAmount = searchParams.get('amount');

    if (toEmail) {
      supabase
        .from('profiles')
        .select('*')
        .eq('email', toEmail)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPrefilledRecipient(data);
            if (requestAmount) {
              setAmount(requestAmount);
            }
            setStep("amount");
          }
        });
    }
  }, [searchParams]);

  const handleNumberPress = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handlePay = async () => {
    if (!prefilledRecipient || !amount) return;

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) return;

    // Show confirmation first
    if (step === "amount") {
      setStep("confirm");
      return;
    }

    setIsSending(true);
    try {
      await sendMoney.mutateAsync({
        recipientId: prefilledRecipient.user_id,
        amount: amountNum,
        description: `Payment to ${prefilledRecipient.display_name || prefilledRecipient.email || 'user'}`,
      });

      setCompletedTransaction({
        id: crypto.randomUUID(),
        amount: amountNum,
        currency: "USD",
        description: `Payment to ${prefilledRecipient.display_name || prefilledRecipient.email || 'user'}`,
        created_at: new Date().toISOString(),
        status: "completed",
        recipientName: prefilledRecipient.display_name,
        recipientEmail: prefilledRecipient.email,
      });
      setStep("success");
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsSending(false);
    }
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-[#009CDE] text-white">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (step === "confirm") setStep("amount");
            else if (step === "amount" && !prefilledRecipient) setStep("options");
            else navigate("/");
          }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">
          {step === "options" ? "Pay" : step === "confirm" ? "Confirm Payment" : prefilledRecipient ? `Pay ${prefilledRecipient.display_name || prefilledRecipient.email?.split('@')[0]}` : "Pay"}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "options" ? (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 p-6"
          >
            <h2 className="text-xl font-semibold mb-6">How would you like to pay?</h2>

            <div className="space-y-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/send")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-[#009CDE]/50 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-[#009CDE]/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-[#009CDE]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Send to a Friend</p>
                  <p className="text-sm text-muted-foreground">Pay someone using their email</p>
                </div>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/scan")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-[#009CDE]/50 transition-all"
              >
                <div className="w-14 h-14 rounded-full bg-[#009CDE]/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-[#009CDE]" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold">Pay in Store</p>
                  <p className="text-sm text-muted-foreground">Scan QR code at checkout</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        ) : step === "amount" && prefilledRecipient ? (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Recipient Info */}
            <div className="px-4 py-6 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003087] to-[#009CDE] flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {getInitials(prefilledRecipient.display_name, prefilledRecipient.email)}
                </span>
              </div>
              <div>
                <p className="font-semibold">{prefilledRecipient.display_name || prefilledRecipient.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-muted-foreground">{prefilledRecipient.email}</p>
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
                  ←
                </motion.button>
              </div>
              <Button
                disabled={!amount || parseFloat(amount) === 0 || parseFloat(amount) > Number(balance?.amount || 0)}
                onClick={handlePay}
                className="w-full h-14 text-lg font-semibold rounded-full bg-[#009CDE] hover:bg-[#003087]"
              >
                {`Pay $${amount || "0"}`}
              </Button>
            </div>
          </motion.div>
        ) : step === "confirm" && prefilledRecipient ? (
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
                <div className="w-20 h-20 rounded-full bg-[#009CDE]/10 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-[#009CDE] animate-spin" />
                </div>
                <p className="text-lg font-semibold text-foreground">Sending payment...</p>
                <p className="text-sm text-muted-foreground">Please wait while we process your transfer</p>
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-sm mb-6"
                >
                  <div className="text-center mb-5">
                    <p className="text-sm text-muted-foreground mb-1">You are paying</p>
                    <p className="text-4xl font-bold text-foreground">${parseFloat(amount).toFixed(2)}</p>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#003087] to-[#009CDE] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white">
                          {getInitials(prefilledRecipient.display_name, prefilledRecipient.email)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">To</p>
                        <p className="font-semibold text-foreground truncate">
                          {prefilledRecipient.display_name || prefilledRecipient.email?.split('@')[0] || 'User'}
                        </p>
                        {prefilledRecipient.email && (
                          <p className="text-xs text-muted-foreground truncate">{prefilledRecipient.email}</p>
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
                    className="w-full h-14 text-lg font-semibold rounded-full bg-[#009CDE] hover:bg-[#003087]"
                  >
                    Confirm & Pay ${parseFloat(amount).toFixed(2)}
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
        ) : null}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {step === "success" && completedTransaction && (
          <Receipt
            transaction={completedTransaction}
            type="sent"
            onClose={() => navigate("/")}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
