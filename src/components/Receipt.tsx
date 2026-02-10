import { useRef } from "react";
import { motion } from "framer-motion";
import { X, User, Copy, Mail, CheckCircle2, Clock, Loader2, ArrowUpRight, ArrowDownLeft, Shield, Hash, Download, Share2, FileText } from "lucide-react";
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

// Each timeline step gets its own color scheme
const stepColors = {
  submitted: { bg: "#003087", icon: "#fff" },
  processing: { bg: "#0070BA", icon: "#fff" },
  complete: { bg: "#00A651", icon: "#fff" },
  inactive: { bg: "#dde0e4", icon: "#a0a4a8" },
};

function StatusDot({ step, active, completed, processing }: { step: "submitted" | "processing" | "complete"; active: boolean; completed: boolean; processing?: boolean }) {
  const colors = stepColors[step];
  if (processing) {
    return (
      <motion.div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.bg }}
        animate={{ scale: [1, 1.1, 1] }}
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
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <CheckCircle2 className="h-4 w-4 text-white" />
      </motion.div>
    );
  }
  if (active) {
    return <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.bg }} />;
  }
  return <div className="w-6 h-6 rounded-full" style={{ backgroundColor: stepColors.inactive.bg }} />;
}

export function Receipt({ transaction, type, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handleShare = async () => {
    const shareData = {
      title: `PayPal Receipt`,
      text: `${type === "sent" ? "Sent" : "Received"} $${transaction.amount.toFixed(2)} ${type === "sent" ? "to" : "from"} ${otherPartyName}\nDate: ${formattedDate}\nTransaction ID: ${transaction.id}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast.success("Receipt details copied to clipboard");
      }
    } catch {
      // User cancelled share
    }
  };

  const handleDownload = () => {
    const text = [
      "PayPal Transaction Receipt",
      "═".repeat(35),
      "",
      `Type: ${type === "sent" ? "Money Sent" : "Money Received"}`,
      `Amount: $${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      `Date: ${formattedDate}`,
      `Status: ${statusLabel}`,
      "",
      `${type === "sent" ? "Sent to" : "Received from"}: ${otherPartyName}`,
      otherPartyEmail ? `Email: ${otherPartyEmail}` : "",
      transaction.description ? `Note: ${transaction.description}` : "",
      "",
      `Transaction ID: ${transaction.id}`,
      "",
      "═".repeat(35),
      "PayPal Pte. Ltd. · Secure Transaction",
    ].filter(Boolean).join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paypal-receipt-${transaction.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded");
  };

  const handleSaveClipboard = () => {
    const text = `PayPal Receipt\n${type === "sent" ? "Sent" : "Received"} $${transaction.amount.toFixed(2)} ${type === "sent" ? "to" : "from"} ${otherPartyName}\nDate: ${formattedDate}\nTransaction ID: ${transaction.id}`;
    navigator.clipboard.writeText(text);
    toast.success("Receipt saved to clipboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-auto"
      style={{ backgroundColor: "#f5f7fa" }}
    >
      <div ref={receiptRef}>
        {/* Header */}
        <div style={{ background: "linear-gradient(180deg, #142C8E 0%, #253B80 100%)" }} className="text-white">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <PayPalLogo className="h-7" white />
            <div className="w-9" />
          </div>

          {/* Amount */}
          <div className="text-center px-6 pt-3 pb-7">
            <div className="flex items-center justify-center mb-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                type === "sent" ? "bg-white/15" : "bg-[#00A651]/30"
              }`}>
                {type === "sent" ? (
                  <ArrowUpRight className="h-4 w-4 text-white/90" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-white/90" />
                )}
              </div>
            </div>
            <p className="text-white/60 text-xs mb-0.5">
              {type === "sent" ? "You sent" : "You received"}
            </p>
            <h1 className="text-4xl font-semibold text-white tracking-tight">
              ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h1>
            <p className="text-white/40 text-xs mt-1.5">{formattedDate}</p>

            {/* Status */}
            <div className="flex justify-center mt-3">
              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${
                isCompleted
                  ? "bg-[#00A651]/20 text-[#7dd3a8]"
                  : isProcessing
                  ? "bg-white/10 text-white/80"
                  : "bg-white/10 text-white/60"
              }`}>
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isProcessing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {statusLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="px-4 pb-6 -mt-1.5">
          {/* To / From */}
          <div className="bg-white rounded-xl p-4 mb-2.5" style={{ border: "1px solid #eaedf0" }}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#253B80] flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-white/90" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[#8b9099] uppercase tracking-wider font-medium">
                  {type === "sent" ? "Sent to" : "Received from"}
                </p>
                <p className="text-[15px] font-medium text-[#2c2e2f] truncate">{otherPartyName}</p>
                {otherPartyEmail && (
                  <p className="text-xs text-[#8b9099] truncate">{otherPartyEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Transfer Status */}
          <div className="bg-white rounded-xl p-4 mb-2.5" style={{ border: "1px solid #eaedf0" }}>
            <h2 className="text-[10px] font-medium text-[#8b9099] mb-4 uppercase tracking-wider">
              Transfer Status
            </h2>

            <div className="relative pl-9">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px]">
                <div className="h-full bg-[#eaedf0] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ height: "0%" }}
                    animate={{ height: isCompleted ? "100%" : isProcessing ? "50%" : "15%" }}
                    transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                    className="w-full"
                    style={{
                      background: isCompleted
                        ? "linear-gradient(180deg, #003087, #0070BA, #00A651)"
                        : "linear-gradient(180deg, #003087, #0070BA)",
                    }}
                  />
                </div>
              </div>

              {/* Submitted */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="relative mb-5"
              >
                <div className="absolute left-[-36px] top-0">
                  <StatusDot step="submitted" active completed />
                </div>
                <p className="text-sm font-medium text-[#2c2e2f]">Submitted</p>
                <p className="text-xs text-[#8b9099]">Payment initiated successfully</p>
              </motion.div>

              {/* Processing */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative mb-5"
              >
                <div className="absolute left-[-36px] top-0">
                  <StatusDot
                    step="processing"
                    active={isProcessing || isCompleted}
                    completed={isCompleted}
                    processing={isProcessing}
                  />
                </div>
                <p className={`text-sm font-medium ${isProcessing || isCompleted ? "text-[#2c2e2f]" : "text-[#c0c3c8]"}`}>
                  Processing
                </p>
                <p className="text-xs text-[#8b9099]">
                  {isProcessing ? "Verifying transaction..." : isCompleted ? "Verification complete" : "Awaiting confirmation"}
                </p>
              </motion.div>

              {/* Complete */}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="relative"
              >
                <div className="absolute left-[-36px] top-0">
                  <StatusDot step="complete" active={isCompleted} completed={isCompleted} />
                </div>
                <p className={`text-sm font-medium ${isCompleted ? "text-[#2c2e2f]" : "text-[#c0c3c8]"}`}>
                  Complete
                </p>
                <p className={`text-xs ${isCompleted ? "text-[#00A651]" : "text-[#8b9099]"}`}>
                  {isCompleted
                    ? `$${transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} transferred`
                    : "Pending completion"}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white rounded-xl p-4 mb-2.5" style={{ border: "1px solid #eaedf0" }}>
            <h2 className="text-[10px] font-medium text-[#8b9099] mb-3 uppercase tracking-wider">
              Transaction Details
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#f0f2f5] flex items-center justify-center shrink-0">
                  <Hash className="h-4 w-4 text-[#6c7078]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-[#8b9099]">Transaction ID</p>
                  <p className="font-mono text-xs text-[#2c2e2f] truncate">{transaction.id}</p>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-[#f0f2f5] rounded-lg transition-colors shrink-0"
                >
                  <Copy className="h-4 w-4 text-[#0070BA]" />
                </button>
              </div>

              {otherPartyEmail && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0f2f5] flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-[#6c7078]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#8b9099]">
                      {type === "sent" ? "Recipient Email" : "Sender Email"}
                    </p>
                    <p className="text-xs text-[#2c2e2f] truncate">{otherPartyEmail}</p>
                  </div>
                </div>
              )}

              {transaction.description && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0f2f5] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-4 w-4 text-[#6c7078]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#8b9099]">Note</p>
                    <p className="text-xs text-[#2c2e2f]">{transaction.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Protection */}
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white mb-4" style={{ border: "1px solid #eaedf0" }}>
            <Shield className="h-4 w-4 text-[#253B80] shrink-0" />
            <div>
              <p className="text-xs font-medium text-[#253B80]">Purchase Protection</p>
              <p className="text-[10px] text-[#8b9099]">
                Eligible purchases covered by PayPal Buyer Protection
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={handleDownload}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white hover:bg-[#f5f7fa] transition-colors"
              style={{ border: "1px solid #eaedf0" }}
            >
              <Download className="h-5 w-5 text-[#253B80]" />
              <span className="text-[10px] font-medium text-[#2c2e2f]">Download</span>
            </button>
            <button
              onClick={handleSaveClipboard}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white hover:bg-[#f5f7fa] transition-colors"
              style={{ border: "1px solid #eaedf0" }}
            >
              <FileText className="h-5 w-5 text-[#253B80]" />
              <span className="text-[10px] font-medium text-[#2c2e2f]">Save</span>
            </button>
            <button
              onClick={handleShare}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white hover:bg-[#f5f7fa] transition-colors"
              style={{ border: "1px solid #eaedf0" }}
            >
              <Share2 className="h-5 w-5 text-[#253B80]" />
              <span className="text-[10px] font-medium text-[#2c2e2f]">Share</span>
            </button>
          </div>

          {/* Footer */}
          <div className="text-center mb-4">
            <PayPalLogo className="h-5 mx-auto mb-1.5 opacity-25" />
            <p className="text-[10px] text-[#b0b3b8]">
              PayPal Pte. Ltd. · Secure Transaction
            </p>
          </div>

          {/* Done Button */}
          <Button
            onClick={onClose}
            className="w-full rounded-full h-12 text-sm font-medium"
            style={{ backgroundColor: "#253B80" }}
          >
            Done
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
