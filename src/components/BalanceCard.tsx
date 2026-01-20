import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
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
      className="text-center py-8"
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          Your Balance
        </span>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      </div>
      <motion.h1
        key={showBalance ? "visible" : "hidden"}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="balance-display"
      >
        {showBalance ? formatBalance(balance) : "••••••"}
      </motion.h1>
    </motion.div>
  );
}
