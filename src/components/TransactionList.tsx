import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isYesterday } from "date-fns";

export function TransactionList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useTransactions();

  const formatAmount = (amount: number, isSent: boolean) => {
    const prefix = isSent ? "-" : "+";
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Take only the 6 most recent transactions for the home screen
  const recentTransactions = transactions?.slice(0, 6) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="px-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <button 
          onClick={() => navigate('/activity')}
          className="text-sm text-primary font-semibold hover:underline"
        >
          See All
        </button>
      </div>
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No transactions yet</p>
            <p className="text-sm mt-1">Send or receive money to see activity here</p>
          </div>
        ) : (
          recentTransactions.map((transaction, index) => {
            const isSent = transaction.sender_id === user?.id;
            const otherParty = isSent 
              ? transaction.recipient_profile 
              : transaction.sender_profile;
            const otherPartyName = otherParty?.display_name || otherParty?.email?.split('@')[0] || 
              (transaction.description?.includes('Admin') ? 'Admin' : 'User');
            const actionLabel = isSent ? 'Sent to' : 'Received from';

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className={`transaction-item ${
                  index !== recentTransactions.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {isSent ? (
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{otherPartyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {actionLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      isSent ? "text-foreground" : "text-emerald-600"
                    }`}
                  >
                    {formatAmount(transaction.amount, isSent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}