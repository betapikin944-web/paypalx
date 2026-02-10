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

const PayPalLogo = ({ className = "h-7", white = false }: { className?: string; white?: boolean }) => (
  <svg viewBox="0 0 101 32" className={className} preserveAspectRatio="xMinYMin meet">
    <path fill={white ? "#ffffff" : "#003087"} d="M12.237 2.8h-7.8c-.5 0-1 .4-1.1.9L.006 25.4c-.1.5.3.9.8.9h3.7c.5 0 1-.4 1.1-.9l.9-5.4c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.3-3.3-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.5 1.2.5 2.1z" />
    <path fill={white ? "#ffffff" : "#003087"} d="M35.437 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.4-.9-.9-.9zm-5.4 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .6.7.8 1.7.6 2.7z" />
    <path fill={white ? "#ffffff" : "#003087"} d="M55.337 10h-3.7c-.4 0-.7.2-.9.5l-5.2 7.6-2.2-7.3c-.1-.5-.6-.8-1.1-.8h-3.6c-.5 0-.9.5-.7 1l4.1 12.1-3.9 5.4c-.4.5 0 1.2.6 1.2h3.7c.4 0 .7-.2.9-.5l12.5-18c.4-.5 0-1.2-.5-1.2z" />
    <path fill={white ? "#c4dcf3" : "#0070BA"} d="M67.737 2.8h-7.8c-.5 0-1 .4-1.1.9l-3.4 21.7c-.1.5.3.9.8.9h4c.4 0 .7-.3.8-.7l1-6.1c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.4-3.4-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.6 1.2.5 2.1z" />
    <path fill={white ? "#c4dcf3" : "#0070BA"} d="M90.937 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.3-.9-.8-.9zm-5.5 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .7.7.9 1.7.6 2.7z" />
    <path fill={white ? "#c4dcf3" : "#0070BA"} d="M95.337 3.3l-3.5 22c-.1.5.3.9.8.9h3.2c.5 0 1-.4 1.1-.9l3.4-21.6c.1-.5-.3-.9-.8-.9h-3.5c-.3 0-.6.2-.7.5z" />
  </svg>
);

function StatusDot({ active, completed, processing }: { active: boolean; completed: boolean; processing?: boolean }) {
  if (processing) {
    return (
      <motion.div
        className="w-7 h-7 rounded-full bg-[#0070BA] flex items-center justify-center"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Loader2 className="h-4 w-4 text-white animate-spin" />
      </motion.div>
    );
  }
  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-7 h-7 rounded-full bg-[#00A651] flex items-center justify-center"
      >
        <CheckCircle2 className="h-5 w-5 text-white" />
      </motion.div>
    );
  }
  if (active) {
    return <div className="w-7 h-7 rounded-full bg-[#003087]" />;
  }
  return <div className="w-7 h-7 rounded-full bg-[#e8e8e8] border-2 border-[#d0d0d0]" />;
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
      className="fixed inset-0 z-50 overflow-auto"
      style={{ backgroundColor: "#f5f7fa" }}
    >
      {/* Dark Blue Header */}
      <div style={{ background: "linear-gradient(180deg, #001C64 0%, #003087 100%)" }} className="text-white">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <PayPalLogo className="h-8" white />
          <div className="w-10" />
        </div>

        {/* Amount Section */}
        <div className="text-center px-6 pt-4 pb-8">
          <div className="flex items-center justify-center mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              type === "sent" ? "bg-white/20" : "bg-[#00A651]/40"
            }`}>
              {type === "sent" ? (
                <ArrowUpRight className="h-5 w-5 text-white" />
              ) : (
                <ArrowDownLeft className="h-5 w-5 text-white" />
              )}
            </div>
          </div>
          <p className="text-white/70 text-sm mb-1">
            {type === "sent" ? "You sent" : "You received"}
          </p>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-1">
            ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h1>
          <p className="text-white/50 text-sm mt-2">{formattedDate}</p>

          {/* Status Badge */}
          <div className="flex justify-center mt-4">
            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${
              isCompleted ? "bg-[#00A651]/20 border border-[#00A651]/30" : isProcessing ? "bg-white/10 border border-white/20" : "bg-white/10 border border-white/20"
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-[#00A651]" />
              ) : isProcessing ? (
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              ) : (
                <Clock className="h-4 w-4 text-white/70" />
              )}
              <span className={`text-sm font-semibold capitalize ${
                isCompleted ? "text-[#00A651]" : "text-white"
              }`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="px-4 pb-8 -mt-2">
        {/* Recipient / Sender Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-[#e8e8e8]"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#003087] flex items-center justify-center shrink-0">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#687173] uppercase tracking-wider font-semibold">
                {type === "sent" ? "SENT TO" : "RECEIVED FROM"}
              </p>
              <p className="text-lg font-semibold text-[#1a1a2e] truncate">{otherPartyName}</p>
              {otherPartyEmail && (
                <p className="text-sm text-[#687173] truncate">{otherPartyEmail}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Transfer Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-[#e8e8e8]"
        >
          <h2 className="text-[11px] font-semibold text-[#687173] mb-5 uppercase tracking-wider">
            TRANSFER STATUS
          </h2>

          <div className="relative pl-10">
            {/* Timeline Line */}
            <div className="absolute left-[13px] top-4 bottom-4 w-[3px]">
              <div className="h-full bg-[#e8e8e8] rounded-full overflow-hidden">
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
              transition={{ delay: 0.3 }}
              className="relative mb-7"
            >
              <div className="absolute left-[-40px] top-0">
                <StatusDot active completed />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[#1a1a2e]">Submitted</p>
                <p className="text-sm text-[#687173]">Payment initiated successfully</p>
              </div>
            </motion.div>

            {/* Processing */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="relative mb-7"
            >
              <div className="absolute left-[-40px] top-0">
                <StatusDot
                  active={isProcessing || isCompleted}
                  completed={isCompleted}
                  processing={isProcessing}
                />
              </div>
              <div>
                <p className={`text-[15px] font-semibold ${isProcessing || isCompleted ? 'text-[#1a1a2e]' : 'text-[#b0b0b0]'}`}>
                  Processing
                </p>
                <p className="text-sm text-[#687173]">
                  {isProcessing ? "Verifying transaction..." : isCompleted ? "Verification complete" : "Awaiting confirmation"}
                </p>
              </div>
            </motion.div>

            {/* Complete */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="absolute left-[-40px] top-0">
                <StatusDot active={isCompleted} completed={isCompleted} />
              </div>
              <div>
                <p className={`text-[15px] font-semibold ${isCompleted ? 'text-[#1a1a2e]' : 'text-[#b0b0b0]'}`}>
                  Complete
                </p>
                <p className={`text-sm ${isCompleted ? 'text-[#00A651] font-medium' : 'text-[#687173]'}`}>
                  {isCompleted ? `$${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} transferred` : "Pending completion"}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-[#e8e8e8]"
        >
          <h2 className="text-[11px] font-semibold text-[#687173] mb-4 uppercase tracking-wider">
            TRANSACTION DETAILS
          </h2>

          <div className="space-y-4">
            {/* Transaction ID */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#003087]/10 flex items-center justify-center shrink-0">
                <Hash className="h-5 w-5 text-[#003087]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#687173]">Transaction ID</p>
                <p className="font-mono text-sm text-[#1a1a2e] truncate">{transaction.id}</p>
              </div>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-[#f0f0f0] rounded-full transition-colors shrink-0"
              >
                <Copy className="h-5 w-5 text-[#0070BA]" />
              </button>
            </div>

            {/* Email */}
            {otherPartyEmail && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#003087]/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-[#003087]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#687173]">
                    {type === "sent" ? "Recipient Email" : "Sender Email"}
                  </p>
                  <p className="text-sm font-medium text-[#1a1a2e] truncate">{otherPartyEmail}</p>
                </div>
              </div>
            )}

            {/* Note */}
            {transaction.description && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#003087]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="h-5 w-5 text-[#003087]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#687173]">Note</p>
                  <p className="text-sm text-[#1a1a2e]">{transaction.description}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Purchase Protection */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-[#e8e8e8] mb-5 shadow-sm"
        >
          <Shield className="h-5 w-5 text-[#003087] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#003087]">Purchase Protection</p>
            <p className="text-xs text-[#687173]">
              Eligible purchases are covered by PayPal Buyer Protection
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mb-5">
          <PayPalLogo className="h-6 mx-auto mb-2 opacity-30" />
          <p className="text-[11px] text-[#b0b0b0]">
            PayPal Pte. Ltd. · Secure Transaction
          </p>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          className="w-full rounded-full h-13 text-base font-semibold"
          style={{ backgroundColor: "#003087" }}
        >
          Done
        </Button>
      </div>
    </motion.div>
  );
}
