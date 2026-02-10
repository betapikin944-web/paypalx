import { motion, AnimatePresence } from "framer-motion";
import { X, User, Copy, Mail, CheckCircle2, Clock, Loader2, ArrowUpRight, ArrowDownLeft, Shield } from "lucide-react";
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

function StatusDot({ active, completed, processing }: { active: boolean; completed: boolean; processing?: boolean }) {
  if (processing) {
    return (
      <motion.div
        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Loader2 className="h-3 w-3 text-primary-foreground animate-spin" />
      </motion.div>
    );
  }
  if (completed) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
      >
        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
      </motion.div>
    );
  }
  if (active) {
    return <div className="w-5 h-5 rounded-full bg-foreground" />;
  }
  return <div className="w-5 h-5 rounded-full bg-muted border-2 border-border" />;
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

  const statusColor = isCompleted ? "text-emerald-600" : isProcessing ? "text-primary" : "text-muted-foreground";
  const statusBg = isCompleted ? "bg-emerald-50" : isProcessing ? "bg-primary/5" : "bg-muted";
  const statusLabel = isCompleted ? "Completed" : isProcessing ? "Processing" : transaction.status;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-auto"
    >
      {/* Top accent bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`h-1 origin-left ${isCompleted ? "bg-emerald-500" : "bg-primary"}`}
      />

      <div className="min-h-screen px-5 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between py-3">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <svg viewBox="0 0 101 32" className="h-5" preserveAspectRatio="xMinYMin meet">
              <path fill="#003087" d="M12.237 2.8h-7.8c-.5 0-1 .4-1.1.9L.006 25.4c-.1.5.3.9.8.9h3.7c.5 0 1-.4 1.1-.9l.9-5.4c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.3-3.3-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.5 1.2.5 2.1z"></path>
              <path fill="#003087" d="M35.437 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.4-.9-.9-.9zm-5.4 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .6.7.8 1.7.6 2.7z"></path>
              <path fill="#003087" d="M55.337 10h-3.7c-.4 0-.7.2-.9.5l-5.2 7.6-2.2-7.3c-.1-.5-.6-.8-1.1-.8h-3.6c-.5 0-.9.5-.7 1l4.1 12.1-3.9 5.4c-.4.5 0 1.2.6 1.2h3.7c.4 0 .7-.2.9-.5l12.5-18c.4-.5 0-1.2-.5-1.2z"></path>
              <path fill="#0070BA" d="M67.737 2.8h-7.8c-.5 0-1 .4-1.1.9l-3.4 21.7c-.1.5.3.9.8.9h4c.4 0 .7-.3.8-.7l1-6.1c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.4-3.4-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.6 1.2.5 2.1z"></path>
              <path fill="#0070BA" d="M90.937 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.3-.9-.8-.9zm-5.5 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .7.7.9 1.7.6 2.7z"></path>
              <path fill="#0070BA" d="M95.337 3.3l-3.5 22c-.1.5.3.9.8.9h3.2c.5 0 1-.4 1.1-.9l3.4-21.6c.1-.5-.3-.9-.8-.9h-3.5c-.3 0-.6.2-.7.5z"></path>
            </svg>
          </motion.div>
          <div className="w-8" />
        </div>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center mb-4 mt-2"
        >
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statusBg}`}>
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={`text-[11px] font-semibold capitalize ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
        </motion.div>

        {/* Amount Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              type === "sent" ? "bg-muted" : "bg-emerald-50"
            }`}>
              {type === "sent" ? (
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {type === "sent" ? "-" : "+"}${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {type === "sent" ? "Sent to" : "Received from"} <span className="font-medium text-foreground">{otherPartyName}</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{formattedDate}</p>
        </motion.div>

        {/* Transfer Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-4 mb-4"
        >
          <h2 className="text-[11px] font-semibold text-foreground mb-4 uppercase tracking-wider">Transfer Status</h2>
          
          <div className="relative pl-7">
            {/* Timeline Line */}
            <div className="absolute left-[9px] top-3 bottom-3 w-[2px]">
              <div className="h-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: isCompleted ? "100%" : isProcessing ? "50%" : "15%" }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className={`w-full ${isCompleted ? "bg-emerald-500" : "bg-primary"}`}
                />
              </div>
            </div>
            
            {/* Submitted */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative mb-5"
            >
              <div className="absolute left-[-28px] top-0">
                <StatusDot active completed />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Submitted</p>
                <p className="text-[10px] text-muted-foreground">Payment initiated</p>
              </div>
            </motion.div>

            {/* Processing */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              className="relative mb-5"
            >
              <div className="absolute left-[-28px] top-0">
                <StatusDot
                  active={isProcessing || isCompleted}
                  completed={isCompleted}
                  processing={isProcessing}
                />
              </div>
              <div>
                <p className={`text-xs font-semibold ${isProcessing || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Processing
                </p>
                <p className="text-[10px] text-muted-foreground">
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
              <div className="absolute left-[-28px] top-0">
                <StatusDot active={isCompleted} completed={isCompleted} />
              </div>
              <div>
                <p className={`text-xs font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Complete
                </p>
                <p className={`text-[10px] ${isCompleted ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}`}>
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
          className="bg-card rounded-xl border border-border p-4 mb-4"
        >
          <h2 className="text-[11px] font-semibold text-foreground mb-3 uppercase tracking-wider">Details</h2>
          
          <div className="space-y-3">
            {/* Recipient/Sender */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">{type === "sent" ? "To" : "From"}</p>
                <p className="text-xs font-medium text-foreground truncate">{otherPartyName}</p>
              </div>
            </div>

            {/* Email */}
            {otherPartyEmail && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-muted-foreground">Email</p>
                  <p className="text-xs font-medium text-foreground truncate">{otherPartyEmail}</p>
                </div>
              </div>
            )}

            {/* Transaction ID */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Transaction ID</p>
                <p className="font-mono text-[10px] text-foreground truncate">{transaction.id}</p>
              </div>
              <button 
                onClick={handleCopy}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0"
              >
                <Copy className="h-3.5 w-3.5 text-primary" />
              </button>
            </div>
          </div>

          {transaction.description && (
            <div className="mt-3 p-2.5 bg-muted rounded-lg">
              <p className="text-[10px] text-muted-foreground">Note</p>
              <p className="text-xs text-foreground">{transaction.description}</p>
            </div>
          )}
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 mb-6"
        >
          <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
          <p className="text-[9px] text-muted-foreground">
            Protected by PayPal Purchase Protection
          </p>
        </motion.div>

        {/* Close Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Button 
            onClick={onClose}
            className="w-full rounded-full bg-primary hover:bg-primary/90 h-10 text-xs font-semibold"
          >
            Done
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
