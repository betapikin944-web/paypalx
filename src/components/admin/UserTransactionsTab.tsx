import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Search, ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { getCurrencySymbol } from '@/lib/currencies';

interface UserTransactionsTabProps {
  userId: string;
  transactions: any[];
  users: any[];
}

export function UserTransactionsTab({ userId, transactions, users }: UserTransactionsTabProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const getUserName = (uid: string | null) => {
    if (!uid) return 'System';
    const u = users?.find((p: any) => p.user_id === uid);
    return u?.display_name || u?.email?.split('@')[0] || uid.slice(0, 8) + '...';
  };

  const userTransactions = useMemo(() => {
    return transactions.filter(t => t.sender_id === userId || t.recipient_id === userId);
  }, [transactions, userId]);

  const filteredTransactions = useMemo(() => {
    let result = userTransactions;

    // Type filter
    if (typeFilter === 'sent') {
      result = result.filter(t => t.sender_id === userId);
    } else if (typeFilter === 'received') {
      result = result.filter(t => t.recipient_id === userId);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 86400000);
      result = result.filter(t => new Date(t.created_at) >= cutoff);
    }

    // Search
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(t => {
        const desc = t.description?.toLowerCase() || '';
        const senderName = getUserName(t.sender_id).toLowerCase();
        const recipientName = getUserName(t.recipient_id).toLowerCase();
        const amount = t.amount.toString();
        return desc.includes(s) || senderName.includes(s) || recipientName.includes(s) || amount.includes(s);
      });
    }

    return result;
  }, [userTransactions, typeFilter, statusFilter, dateFilter, search, userId]);

  const totalSent = userTransactions.filter(t => t.sender_id === userId).reduce((s, t) => s + t.amount, 0);
  const totalReceived = userTransactions.filter(t => t.recipient_id === userId).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-muted rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground">Total</p>
          <p className="text-sm font-bold">{userTransactions.length}</p>
        </div>
        <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground">Sent</p>
          <p className="text-sm font-bold text-red-600">${totalSent.toFixed(2)}</p>
        </div>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-center">
          <p className="text-[10px] text-muted-foreground">Received</p>
          <p className="text-sm font-bold text-emerald-600">${totalReceived.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-1.5">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-7 text-[10px] flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-7 text-[10px] flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="h-7 text-[10px] flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <p className="text-center text-muted-foreground text-xs py-6">No transactions found</p>
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {filteredTransactions.map((t) => {
            const isSent = t.sender_id === userId;
            return (
              <div key={t.id} className="flex items-center gap-2.5 py-2 px-2 border-b last:border-0 hover:bg-muted/50 rounded">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isSent ? 'bg-red-100 dark:bg-red-950/30' : 'bg-emerald-100 dark:bg-emerald-950/30'}`}>
                  {isSent ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />
                  ) : (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">
                    {isSent ? `To ${getUserName(t.recipient_id)}` : `From ${getUserName(t.sender_id)}`}
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate">
                    {t.description || 'Transfer'} • {format(new Date(t.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-semibold ${isSent ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isSent ? '-' : '+'}${t.amount.toFixed(2)}
                  </p>
                  <Badge variant="outline" className="text-[8px] h-3.5 px-1">
                    {t.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
