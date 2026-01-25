import { motion } from "framer-motion";
import { Eye, EyeOff, Plus, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

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
      className="mx-4 -mt-2"
    >
      {/* Main Balance Card */}
      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground text-sm font-medium">
              PayPal Balance
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
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
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {showBalance ? formatBalance(balance) : "••••••"}
            </h1>
          </motion.div>
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            <Link to="/send" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <ArrowUpRight className="h-4 w-4" />
                Send
              </motion.button>
            </Link>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 py-3 px-6 bg-secondary text-secondary-foreground rounded-full font-semibold text-sm hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </motion.button>
          </div>
        </div>
        
        {/* Card Footer */}
        <div className="border-t border-border px-6 py-3 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Available to spend or transfer
          </p>
        </div>
      </div>
    </motion.div>
  );
}