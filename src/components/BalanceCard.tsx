import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import { useState } from "react";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mx-4 p-6 bg-card rounded-2xl shadow-card border border-border"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm font-medium">
          PayPal balance
        </span>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
      <motion.div
        key={showBalance ? "visible" : "hidden"}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-4"
      >
        <h1 className="balance-display">
          {showBalance ? formatBalance(balance) : "••••••"}
        </h1>
      </motion.div>
      <button className="flex items-center text-primary text-sm font-semibold hover:underline">
        <span>Manage balance</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </motion.div>
  );
}
