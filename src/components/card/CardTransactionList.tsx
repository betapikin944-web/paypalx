import { motion } from "framer-motion";
import { ShoppingBag, Coffee, Fuel, Utensils, ShoppingCart, CreditCard } from "lucide-react";
import { useCardTransactions } from "@/hooks/useCardTransactions";
import { format } from "date-fns";

interface CardTransactionListProps {
  cardId?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  shopping: ShoppingBag,
  food: Coffee,
  gas: Fuel,
  restaurant: Utensils,
  grocery: ShoppingCart,
  default: CreditCard,
};

export function CardTransactionList({ cardId }: CardTransactionListProps) {
  const { data: transactions, isLoading } = useCardTransactions(cardId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
              <div className="h-5 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">No Card Purchases Yet</h3>
        <p className="text-sm text-muted-foreground">
          Your card purchases will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => {
        const Icon = categoryIcons[transaction.merchant_category || 'default'] || categoryIcons.default;
        const isInflow = ["load", "deposit"].includes(transaction.transaction_type);
        const sign = isInflow ? "+" : "-";
        
        return (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-card border border-border"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {transaction.merchant_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.created_at), 'MMM d, yyyy • h:mm a')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {sign}${transaction.amount.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {transaction.status}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
