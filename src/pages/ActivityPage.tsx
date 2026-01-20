import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { TransactionList } from "@/components/TransactionList";
import { Calendar, Filter } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold">Activity</h1>
          <p className="text-muted-foreground text-sm">All transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-muted"
          >
            <Calendar className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-muted"
          >
            <Filter className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4 px-4 mb-6"
      >
        <div className="p-4 rounded-2xl bg-card">
          <p className="text-muted-foreground text-sm mb-1">Money In</p>
          <p className="text-2xl font-bold text-primary">+$1,250.00</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
        <div className="p-4 rounded-2xl bg-card">
          <p className="text-muted-foreground text-sm mb-1">Money Out</p>
          <p className="text-2xl font-bold">-$892.45</p>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </div>
      </motion.div>

      {/* Transaction List */}
      <TransactionList />

      <BottomNav />
    </div>
  );
}
