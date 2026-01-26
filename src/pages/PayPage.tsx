import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CreditCard, Store, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendMoney } from "@/hooks/useTransactions";
import { useBalance } from "@/hooks/useBalance";
import { supabase } from "@/integrations/supabase/client";
import { Receipt } from "@/components/Receipt";

export default function PayPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<"options" | "amount" | "success">("options");
  const [amount, setAmount] = useState("");
  const [prefilledRecipient, setPrefilledRecipient] = useState<any>(null);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);

  const { data: balance } = useBalance();
  const sendMoney = useSendMoney();

  // Check for prefilled payment request
  useEffect(() => {
    const toEmail = searchParams.get('to');
    const requestAmount = searchParams.get('amount');

    if (toEmail) {
      // Look up user by email
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
          onClick={() => step === "amount" && !prefilledRecipient ? setStep("options") : navigate("/")}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">
          {step === "options" ? "Pay" : prefilledRecipient ? `Pay ${prefilledRecipient.display_name || prefilledRecipient.email?.split('@')[0]}` : "Pay"}
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
                disabled={!amount || parseFloat(amount) === 0 || parseFloat(amount) > Number(balance?.amount || 0) || sendMoney.isPending}
                onClick={handlePay}
                className="w-full h-14 text-lg font-semibold rounded-full bg-[#009CDE] hover:bg-[#003087]"
              >
                {sendMoney.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `Pay $${amount || "0"}`
                )}
              </Button>
            </div>
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
