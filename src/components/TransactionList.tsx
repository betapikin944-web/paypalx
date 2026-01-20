import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Zap } from "lucide-react";

interface Transaction {
  id: string;
  type: "sent" | "received" | "purchase";
  name: string;
  description?: string;
  amount: number;
  date: string;
  icon?: "shopping" | "coffee" | "lightning";
}

const iconMap = {
  shopping: ShoppingBag,
  coffee: Coffee,
  lightning: Zap,
};

const transactions: Transaction[] = [
  { id: "1", type: "received", name: "Alex Johnson", amount: 250.0, date: "Today" },
  { id: "2", type: "sent", name: "Sarah Miller", amount: -45.0, date: "Today" },
  { id: "3", type: "purchase", name: "Starbucks", description: "Coffee", amount: -6.75, date: "Yesterday", icon: "coffee" },
  { id: "4", type: "received", name: "Cash Back", description: "Boost reward", amount: 12.50, date: "Yesterday", icon: "lightning" },
  { id: "5", type: "purchase", name: "Amazon", description: "Online purchase", amount: -89.99, date: "Dec 18", icon: "shopping" },
  { id: "6", type: "sent", name: "Mike Chen", amount: -150.0, date: "Dec 17" },
];

export function TransactionList() {
  const formatAmount = (amount: number) => {
    const prefix = amount >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  const getIcon = (transaction: Transaction) => {
    if (transaction.icon) {
      const Icon = iconMap[transaction.icon];
      return <Icon className="h-5 w-5" />;
    }
    return transaction.type === "received" ? (
      <ArrowDownLeft className="h-5 w-5 text-primary" />
    ) : (
      <ArrowUpRight className="h-5 w-5" />
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-8 px-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <button className="text-sm text-primary font-medium">See All</button>
      </div>
      <div className="space-y-1">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + index * 0.05 }}
            className="transaction-item"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
              {transaction.icon ? (
                getIcon(transaction)
              ) : (
                <span className="text-sm font-semibold">{getInitials(transaction.name)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{transaction.name}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.description || transaction.date}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-semibold ${
                  transaction.amount >= 0 ? "text-primary" : "text-foreground"
                }`}
              >
                {formatAmount(transaction.amount)}
              </p>
              {transaction.description && (
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
