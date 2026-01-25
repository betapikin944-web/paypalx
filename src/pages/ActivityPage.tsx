import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { Receipt } from "@/components/Receipt";
import { format, isToday, isYesterday } from "date-fns";

export default function ActivityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "h:mm a");
  };

  // Group transactions by date
  const groupedTransactions = transactions?.reduce((groups, transaction) => {
    const date = formatDate(transaction.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof transactions>) || {};

  // Calculate summary
  const summary = transactions?.reduce(
    (acc, t) => {
      if (t.sender_id === user?.id) {
        acc.sent += Number(t.amount);
      } else {
        acc.received += Number(t.amount);
      }
      return acc;
    },
    { sent: 0, received: 0 }
  ) || { sent: 0, received: 0 };

  const handleTransactionClick = (transaction: any) => {
    const isSent = transaction.sender_id === user?.id;
    setSelectedTransaction({
      ...transaction,
      type: isSent ? "sent" : "received",
      recipientName: transaction.recipient_profile?.display_name,
      recipientEmail: transaction.recipient_profile?.email,
      senderName: transaction.sender_profile?.display_name,
      senderEmail: transaction.sender_profile?.email,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Activity</h1>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-sm text-white/80">Money Out</span>
            </div>
            <p className="text-2xl font-bold">${summary.sent.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="h-4 w-4" />
              <span className="text-sm text-white/80">Money In</span>
            </div>
            <p className="text-2xl font-bold">${summary.received.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              When you send or receive money, your transactions will appear here
            </p>
            <Button
              className="mt-6 rounded-full"
              onClick={() => navigate("/send")}
            >
              Send Money
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txns]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  {date}
                </h3>
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {txns?.map((transaction, index) => {
                    const isSent = transaction.sender_id === user?.id;
                    const otherParty = isSent
                      ? transaction.recipient_profile
                      : transaction.sender_profile;
                    const displayName = otherParty?.display_name ||
                      (transaction.description?.includes("Admin") ? "Admin Deposit" : "User");

                    return (
                      <motion.button
                        key={transaction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleTransactionClick(transaction)}
                        className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left ${
                          index !== (txns?.length || 0) - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isSent ? "bg-muted" : "bg-emerald-50"
                        }`}>
                          {isSent ? (
                            <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {displayName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description || (isSent ? "Payment sent" : "Payment received")} • {formatTime(transaction.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isSent ? "text-foreground" : "text-emerald-600"}`}>
                            {isSent ? "-" : "+"}${transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.status}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <Receipt
            transaction={selectedTransaction}
            type={selectedTransaction.type}
            onClose={() => setSelectedTransaction(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}