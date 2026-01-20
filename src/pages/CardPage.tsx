import { motion } from "framer-motion";
import { CashCard } from "@/components/CashCard";
import { BottomNav } from "@/components/BottomNav";
import { Lock, Eye, Snowflake, CreditCard, Plus, ArrowUpDown } from "lucide-react";

const cardActions = [
  { icon: Lock, label: "Lock Card" },
  { icon: Eye, label: "Show Details" },
  { icon: Snowflake, label: "Freeze" },
  { icon: CreditCard, label: "Replace" },
];

export default function CardPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">Cash Card</h1>
        <p className="text-muted-foreground text-sm">Manage your card</p>
      </div>

      {/* Card Display */}
      <div className="px-4 mb-8">
        <CashCard lastFour="4829" cardHolder="JOHN DOE" />
      </div>

      {/* Card Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4 p-6 rounded-2xl bg-card mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Card Balance</span>
          <span className="text-2xl font-bold">$2,847.50</span>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 h-12 rounded-xl gradient-primary font-semibold text-primary-foreground flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Cash
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 h-12 rounded-xl bg-muted font-semibold flex items-center justify-center gap-2"
          >
            <ArrowUpDown className="h-5 w-5" />
            Cash Out
          </motion.button>
        </div>
      </motion.div>

      {/* Card Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-4"
      >
        <h2 className="text-lg font-semibold mb-4">Card Settings</h2>
        <div className="grid grid-cols-2 gap-3">
          {cardActions.map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-xl bg-card flex items-center gap-3 hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}
