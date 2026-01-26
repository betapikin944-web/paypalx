import { motion } from "framer-motion";
import { X, User, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

export function Receipt({ transaction, type, onClose }: ReceiptProps) {
  const otherPartyName = type === "sent" 
    ? transaction.recipientName || "User"
    : transaction.senderName || "User";

  const isCompleted = transaction.status === "completed";
  const isProcessing = transaction.status === "processing" || transaction.status === "pending";

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.id);
    toast.success("Transaction ID copied");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 overflow-auto"
    >
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* PayPal Logo */}
        <div className="mb-6">
          <svg viewBox="0 0 101 32" className="h-8" preserveAspectRatio="xMinYMin meet">
            <path fill="#003087" d="M12.237 2.8h-7.8c-.5 0-1 .4-1.1.9L.006 25.4c-.1.5.3.9.8.9h3.7c.5 0 1-.4 1.1-.9l.9-5.4c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.3-3.3-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.5 1.2.5 2.1z"></path>
            <path fill="#003087" d="M35.437 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.4-.9-.9-.9zm-5.4 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .6.7.8 1.7.6 2.7z"></path>
            <path fill="#003087" d="M55.337 10h-3.7c-.4 0-.7.2-.9.5l-5.2 7.6-2.2-7.3c-.1-.5-.6-.8-1.1-.8h-3.6c-.5 0-.9.5-.7 1l4.1 12.1-3.9 5.4c-.4.5 0 1.2.6 1.2h3.7c.4 0 .7-.2.9-.5l12.5-18c.4-.5 0-1.2-.5-1.2z"></path>
            <path fill="#0070BA" d="M67.737 2.8h-7.8c-.5 0-1 .4-1.1.9l-3.4 21.7c-.1.5.3.9.8.9h4c.4 0 .7-.3.8-.7l1-6.1c.1-.5.5-.9 1.1-.9h2.5c5.1 0 8.1-2.5 8.9-7.4.4-2.1 0-3.8-1-5-1.2-1.4-3.4-2-6-1.9zm.9 7.3c-.4 2.8-2.6 2.8-4.6 2.8h-1.2l.8-5.2c.1-.3.3-.5.6-.5h.5c1.4 0 2.7 0 3.4.8.4.5.6 1.2.5 2.1z"></path>
            <path fill="#0070BA" d="M90.937 10h-3.7c-.3 0-.6.2-.6.5l-.2 1-.3-.4c-.8-1.2-2.6-1.6-4.4-1.6-4.1 0-7.6 3.1-8.3 7.5-.4 2.2.1 4.3 1.4 5.7 1.2 1.3 2.9 1.9 4.9 1.9 3.5 0 5.4-2.2 5.4-2.2l-.2 1c-.1.5.3.9.8.9h3.4c.5 0 1-.4 1.1-.9l2-12.5c.1-.4-.3-.9-.8-.9zm-5.5 7.2c-.4 2.1-2 3.6-4.2 3.6-1.1 0-2-.3-2.5-1-.5-.7-.7-1.6-.5-2.7.3-2.1 2.1-3.6 4.1-3.6 1.1 0 1.9.4 2.5 1 .7.7.9 1.7.6 2.7z"></path>
            <path fill="#0070BA" d="M95.337 3.3l-3.5 22c-.1.5.3.9.8.9h3.2c.5 0 1-.4 1.1-.9l3.4-21.6c.1-.5-.3-.9-.8-.9h-3.5c-.3 0-.6.2-.7.5z"></path>
          </svg>
        </div>

        {/* Main Heading */}
        <h1 className="text-2xl font-bold text-foreground mb-12">
          You've have {type === "sent" ? "sent" : "received"} ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency} {type === "sent" ? "to" : "from"} {otherPartyName}.
        </h1>

        {/* Confirmation Notice */}
        <div className="border-t border-border pt-4 mb-6">
          <p className="text-muted-foreground text-sm">
            {isCompleted ? "Transfer completed" : "Confirmation needed to completed"}
          </p>
        </div>

        {/* Transfer Status */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Transfer status</h2>
          
          <div className="relative pl-6">
            {/* Timeline Line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-muted"></div>
            
            {/* Submitted */}
            <div className="relative mb-6">
              <div className="absolute left-[-24px] top-1 w-4 h-4 rounded-full bg-foreground"></div>
              <div>
                <p className="font-semibold text-foreground">Submitted</p>
                <p className="text-sm text-muted-foreground">Withdrawal created</p>
              </div>
            </div>

            {/* Processing */}
            <div className="relative mb-6">
              <div className={`absolute left-[-24px] top-1 w-4 h-4 rounded-full ${isProcessing || isCompleted ? 'bg-foreground' : 'bg-muted'}`}></div>
              <div>
                <p className={`font-semibold ${isProcessing || isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>Processing</p>
                <p className="text-sm text-muted-foreground">Awaiting confirmation</p>
              </div>
            </div>

            {/* Complete */}
            <div className="relative">
              <div className={`absolute left-[-24px] top-1 w-4 h-4 rounded-full ${isCompleted ? 'bg-foreground' : 'bg-muted'}`}></div>
              <div>
                <p className={`font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>Complete</p>
                <p className={`text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Transaction details</h2>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{type === "sent" ? "To" : "From"}</p>
                <p className="font-semibold text-foreground">{otherPartyName}</p>
              </div>
            </div>
            <button 
              onClick={handleCopy}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Copy className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {transaction.description && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Note: {transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency} needed to be deposited.
              </p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-8 pt-6 border-t border-border">
          <Button 
            onClick={onClose}
            className="w-full rounded-full bg-primary hover:bg-primary/90"
          >
            Done
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
