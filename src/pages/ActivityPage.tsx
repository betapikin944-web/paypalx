import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { TransactionList } from "@/components/TransactionList";
import { Calendar, Filter } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export default function ActivityPage() {
  const { user } = useAuth();
  const { data: transactions } = useTransactions();

  const { moneyIn, moneyOut } = useMemo(() => {
    if (!transactions || !user) return { moneyIn: 0, moneyOut: 0 };

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.reduce(
      (acc, t) => {
        const transactionDate = new Date(t.created_at);
        if (transactionDate >= startOfMonth) {
          if (t.recipient_id === user.id) {
            acc.moneyIn += Number(t.amount);
          } else if (t.sender_id === user.id) {
            acc.moneyOut += Number(t.amount);
          }
        }
        return acc;
      },
      { moneyIn: 0, moneyOut: 0 }
    );
  }, [transactions, user]);

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity</h1>
          <p className="text-muted-foreground text-sm">All transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <Calendar className="h-5 w-5 text-foreground" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <Filter className="h-5 w-5 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4 px-4 py-4"
      >
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-muted-foreground text-sm mb-1">Money In</p>
          <p className="text-2xl font-bold text-green-600">
            +${moneyIn.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border">
          <p className="text-muted-foreground text-sm mb-1">Money Out</p>
          <p className="text-2xl font-bold text-red-600">
            -${moneyOut.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </motion.div>

      {/* Transaction List */}
      <TransactionList />

      <BottomNav />
    </div>
  );
}
