import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, FileText, Loader2, Search, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Receipt } from "@/components/Receipt";
import { format, isToday, isYesterday, subDays, subMonths } from "date-fns";
import { getCurrencySymbol } from "@/lib/currencies";

type FilterType = "all" | "sent" | "received";
type DateRange = "all" | "7d" | "30d" | "90d";

export default function ActivityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: transactions, isLoading } = useTransactions();
  const { data: profile } = useProfile();
  const userCurrency = (profile as any)?.preferred_currency || 'USD';
  const cs = getCurrencySymbol(userCurrency);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d, yyyy");
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "h:mm a");
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    let filtered = [...transactions];

    // Type filter
    if (filter === "sent") {
      filtered = filtered.filter(t => t.sender_id === user?.id);
    } else if (filter === "received") {
      filtered = filtered.filter(t => t.recipient_id === user?.id);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = dateRange === "7d" ? subDays(now, 7) : dateRange === "30d" ? subMonths(now, 1) : subMonths(now, 3);
      filtered = filtered.filter(t => new Date(t.created_at) >= cutoff);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const senderName = t.sender_profile?.display_name?.toLowerCase() || "";
        const recipientName = t.recipient_profile?.display_name?.toLowerCase() || "";
        const desc = t.description?.toLowerCase() || "";
        const amount = t.amount.toString();
        return senderName.includes(q) || recipientName.includes(q) || desc.includes(q) || amount.includes(q);
      });
    }

    return filtered;
  }, [transactions, filter, dateRange, searchQuery, user?.id]);

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = formatDate(transaction.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, typeof filteredTransactions>);

  // Calculate summary from filtered
  const summary = filteredTransactions.reduce(
    (acc, t) => {
      if (t.sender_id === user?.id) {
        acc.sent += Number(t.amount);
      } else {
        acc.received += Number(t.amount);
      }
      return acc;
    },
    { sent: 0, received: 0 }
  );

  const handleTransactionClick = (transaction: any) => {
    const isSent = transaction.sender_id === user?.id;
    setSelectedTransaction({
      id: transaction.id,
      amount: transaction.amount,
      currency: transaction.currency,
      description: transaction.description,
      created_at: transaction.created_at,
      status: transaction.status,
      type: isSent ? "sent" : "received",
      recipientName: transaction.recipient_profile?.display_name || 'User',
      recipientEmail: transaction.recipient_profile?.email,
      senderName: transaction.sender_profile?.display_name || 'User',
      senderEmail: transaction.sender_profile?.email,
    });
  };

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Sent", value: "sent" },
    { label: "Received", value: "received" },
  ];

  const dateButtons: { label: string; value: DateRange }[] = [
    { label: "All Time", value: "all" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/10 h-8 w-8"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-semibold">Activity</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/10 h-8 w-8"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-[10px] text-white/80">Money Out</span>
            </div>
            <p className="text-lg font-bold">{cs}{summary.sent.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownLeft className="h-3 w-3" />
              <span className="text-[10px] text-white/80">Money In</span>
            </div>
            <p className="text-lg font-bold">{cs}{summary.received.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-3 space-y-2 border-b border-border bg-card">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs rounded-lg"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {/* Type filter */}
              <div className="flex gap-1.5">
                {filterButtons.map(btn => (
                  <button
                    key={btn.value}
                    onClick={() => setFilter(btn.value)}
                    className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${
                      filter === btn.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              {/* Date filter */}
              <div className="flex gap-1.5">
                {dateButtons.map(btn => (
                  <button
                    key={btn.value}
                    onClick={() => setDateRange(btn.value)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                      dateRange === btn.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter indicator */}
        {(filter !== "all" || dateRange !== "all") && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Filters:</span>
            {filter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                {filter}
                <button onClick={() => setFilter("all")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
            {dateRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                {dateRange}
                <button onClick={() => setDateRange("all")}><X className="h-2.5 w-2.5" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="px-3 pt-2 pb-1">
        <p className="text-[10px] text-muted-foreground">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Transactions List */}
      <div className="px-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-xs font-semibold mb-1">No Transactions Found</h3>
            <p className="text-[10px] text-muted-foreground max-w-xs mx-auto">
              {searchQuery || filter !== "all" || dateRange !== "all"
                ? "Try adjusting your filters"
                : "When you send or receive money, your transactions will appear here"}
            </p>
            {!searchQuery && filter === "all" && dateRange === "all" && (
              <Button
                size="sm"
                className="mt-4 rounded-full text-xs h-8"
                onClick={() => navigate("/send")}
              >
                Send Money
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedTransactions).map(([date, txns]) => (
              <div key={date}>
                <h3 className="text-[10px] font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  {date}
                </h3>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {txns?.map((transaction, index) => {
                    const isSent = transaction.sender_id === user?.id;
                    const otherParty = isSent
                      ? transaction.recipient_profile
                      : transaction.sender_profile;
                    const otherPartyName = otherParty?.display_name || otherParty?.email?.split('@')[0] ||
                      (transaction.description?.includes("Admin") ? "Admin" : "User");
                    const actionLabel = isSent ? "Sent to" : "Received from";

                    return (
                      <motion.button
                        key={transaction.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleTransactionClick(transaction)}
                        className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${
                          index !== (txns?.length || 0) - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isSent ? "bg-muted" : "bg-emerald-50"
                        }`}>
                          {isSent ? (
                            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {otherPartyName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {actionLabel} · {formatTime(transaction.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-semibold ${isSent ? "text-foreground" : "text-emerald-600"}`}>
                            {isSent ? "-" : "+"}{cs}{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-muted-foreground capitalize">
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
