import { motion } from "framer-motion";
import { X, User, Copy, Mail, CheckCircle2, Clock, Loader2, ArrowUpRight, ArrowDownLeft, Shield, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface ReceiptProps {
  transaction: {
    id: string;
    amount: number;
    currency: string;
    description: string | null;
    created_at: string;
    status: string;
    recipientName?: string;
    recipientEmail?: string;
    senderName?: string;
    senderEmail?: string;
  };
  type: "sent" | "received";
  onClose: () => void;
}

const PayPalLogo = ({ className = "h-6" }: { className?: string }) => (
  <svg viewBox="0 0 101 32" className={className} preserveAspectRatio="xMinYMin meet">
    <path fill="#003087" d="M12.237 2.8h-7.8c-.5 0-1 .4-1.1.9L.006 25.4c-.1.5.3.9.8.9h3.7c.5 0 1-.4 1.1-.9l.9-5.4c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.3-3.3-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.5 1.2.5 2.1z" />
    <path fill="#003087" d="M35.437 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.4-.9-.9-.9zm-5.4 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .6.7.8 1.7.6 2.7z" />
    <path fill="#003087" d="M55.337 10h-3.7c-.4 0-.7.2-.9.5l-5.2 7.6-2.2-7.3c-.1-.5-.6-.8-1.1-.8h-3.6c-.5 0-.9.5-.7 1l4.1 12.1-3.9 5.4c-.4.5 0 1.2.6 1.2h3.7c.4 0 .7-.2.9-.5l12.5-18c.4-.5 0-1.2-.5-1.2z" />
    <path fill="#0070BA" d="M67.737 2.8h-7.8c-.5 0-1 .4-1.1.9l-3.4 21.7c-.1.5.3.9.8.9h4c.4 0 .7-.3.8-.7l1-6.1c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.4-3.4-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.6 1.2.5 2.1z" />
    <path fill="#0070BA" d="M90.937 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.3-.9-.8-.9zm-5.5 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .7.7.9 1.7.6 2.7z" />
    <path fill="#0070BA" d="M95.337 3.3l-3.5 22c-.1.5.3.9.8.9h3.2c.5 0 1-.4 1.1-.9l3.4-21.6c.1-.5-.3-.9-.8-.9h-3.5c-.3 0-.6.2-.7.5z" />
  </svg>
);

function StatusDot({ active, completed, processing }: { active: boolean; completed: boolean; processing?: boolean }) {
  if (processing) {
    return (
      <motion.div
        className="w-6 h-6 rounded-full bg-[#0070BA] flex items-center justify-center shadow-sm"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
      </motion.div>
    );
  }
  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-6 h-6 rounded-full bg-[#00A651] flex items-center justify-center shadow-sm"
      >
        <CheckCircle2 className="h-4 w-4 text-white" />
      </motion.div>
    );
  }
  if (active) {
    return <div className="w-6 h-6 rounded-full bg-[#003087] shadow-sm" />;
  }
  return <div className="w-6 h-6 rounded-full bg-muted border-2 border-border" />;
}

export function Receipt({ transaction, type, onClose }: ReceiptProps) {
  const otherPartyName = type === "sent"
    ? transaction.recipientName || "User"
    : transaction.senderName || "User";

  const otherPartyEmail = type === "sent"
    ? transaction.recipientEmail
    : transaction.senderEmail;

  const isCompleted = transaction.status === "completed";
  const isProcessing = transaction.status === "processing" || transaction.status === "pending";

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.id);
    toast.success("Transaction ID copied");
  };

  const formattedDate = format(new Date(transaction.created_at), "MMM d, yyyy 'at' h:mm a");

  const statusLabel = isCompleted ? "Completed" : isProcessing ? "Processing" : transaction.status;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-auto"
    >
      {/* Header Bar */}
      <div className="bg-[#003087] text-white">
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          >
            <PayPalLogo className="h-7" />
          </motion.div>
          <div className="w-8" />
        </div>

        {/* Amount Section in Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center pb-6 pt-2"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              type === "sent" ? "bg-white/15" : "bg-[#00A651]/30"
            }`}>
              {type === "sent" ? (
                <ArrowUpRight className="h-4 w-4 text-white" />
              ) : (
                <ArrowDownLeft className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
          <p className="text-white/70 text-xs mb-1">
            {type === "sent" ? "You sent" : "You received"}
          </p>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h1>
          <p className="text-white/60 text-xs mt-2">{formattedDate}</p>
        </motion.div>
      </div>

      <div className="px-5 pb-8 -mt-3">
        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex justify-center mb-5"
        >
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border border-border ${
            isCompleted ? "bg-[#00A651]/10" : isProcessing ? "bg-[#0070BA]/10" : "bg-muted"
          }`}>
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-[#00A651]" />
            ) : isProcessing ? (
              <Loader2 className="h-4 w-4 text-[#0070BA] animate-spin" />
            ) : (
              <Clock className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={`text-xs font-semibold capitalize ${
              isCompleted ? "text-[#00A651]" : isProcessing ? "text-[#0070BA]" : "text-muted-foreground"
            }`}>
              {statusLabel}
            </span>
          </div>
        </motion.div>

        {/* Recipient / Sender Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border p-5 mb-4 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003087] to-[#0070BA] flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                {type === "sent" ? "Sent to" : "Received from"}
              </p>
              <p className="text-base font-semibold text-foreground truncate">{otherPartyName}</p>
              {otherPartyEmail && (
                <p className="text-xs text-muted-foreground truncate">{otherPartyEmail}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Transfer Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-2xl border border-border p-5 mb-4 shadow-sm"
        >
          <h2 className="text-[11px] font-semibold text-muted-foreground mb-5 uppercase tracking-wider">
            Transfer Status
          </h2>

          <div className="relative pl-9">
            {/* Timeline Line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-[2px]">
              <div className="h-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: isCompleted ? "100%" : isProcessing ? "50%" : "15%" }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className={`w-full ${isCompleted ? "bg-[#00A651]" : "bg-[#0070BA]"}`}
                />
              </div>
            </div>

            {/* Submitted */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mb-6"
            >
              <div className="absolute left-[-36px] top-0">
                <StatusDot active completed />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Submitted</p>
                <p className="text-xs text-muted-foreground">Payment initiated successfully</p>
              </div>
            </motion.div>

            {/* Processing */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="relative mb-6"
            >
              <div className="absolute left-[-36px] top-0">
                <StatusDot
                  active={isProcessing || isCompleted}
                  completed={isCompleted}
                  processing={isProcessing}
                />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isProcessing || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Processing
                </p>
                <p className="text-xs text-muted-foreground">
                  {isProcessing ? "Verifying transaction..." : isCompleted ? "Verification complete" : "Awaiting confirmation"}
                </p>
              </div>
            </motion.div>

            {/* Complete */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="relative"
            >
              <div className="absolute left-[-36px] top-0">
                <StatusDot active={isCompleted} completed={isCompleted} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Complete
                </p>
                <p className={`text-xs ${isCompleted ? 'text-[#00A651] font-medium' : 'text-muted-foreground'}`}>
                  {isCompleted ? `$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} transferred` : "Pending completion"}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl border border-border p-5 mb-4 shadow-sm"
        >
          <h2 className="text-[11px] font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            Transaction Details
          </h2>

          <div className="space-y-4">
            {/* Transaction ID */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#003087]/10 flex items-center justify-center shrink-0">
                <Hash className="h-4 w-4 text-[#003087]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-xs text-foreground truncate">{transaction.id}</p>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
              >
                <Copy className="h-4 w-4 text-[#0070BA]" />
              </button>
            </div>

            {/* Email */}
            {otherPartyEmail && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#003087]/10 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-[#003087]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">
                    {type === "sent" ? "Recipient Email" : "Sender Email"}
                  </p>
                  <p className="text-xs font-medium text-foreground truncate">{otherPartyEmail}</p>
                </div>
              </div>
            )}

            {/* Note */}
            {transaction.description && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#003087]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-[#003087]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-muted-foreground">Note</p>
                  <p className="text-xs text-foreground">{transaction.description}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Purchase Protection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#003087]/5 border border-[#003087]/10 mb-6"
        >
          <Shield className="h-5 w-5 text-[#003087] shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[#003087]">Purchase Protection</p>
            <p className="text-[10px] text-muted-foreground">
              Eligible purchases are covered by PayPal Purchase Protection
            </p>
          </div>
        </motion.div>

        {/* Footer with Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center mb-6"
        >
          <PayPalLogo className="h-5 mx-auto mb-2 opacity-40" />
          <p className="text-[10px] text-muted-foreground">
            PayPal Pte. Ltd. · Secure Transaction
          </p>
        </motion.div>

        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onClose}
            className="w-full rounded-full bg-[#003087] hover:bg-[#003087]/90 h-12 text-sm font-semibold"
          >
            Done
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
