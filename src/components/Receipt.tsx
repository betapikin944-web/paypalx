import { motion } from "framer-motion";
import { Check, Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export function Receipt({ transaction, type, onClose }: ReceiptProps) {
  const transactionId = transaction.id.slice(0, 8).toUpperCase();
  const formattedDate = format(new Date(transaction.created_at), "MMMM d, yyyy 'at' h:mm a");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Payment Receipt",
          text: `Payment of $${transaction.amount.toFixed(2)} - Transaction ID: ${transactionId}`,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-white text-xl font-semibold mb-1">
            {type === "sent" ? "Payment Sent" : "Payment Received"}
          </h2>
          <p className="text-white/80 text-sm">
            {formattedDate}
          </p>
        </div>

        {/* Amount */}
        <div className="p-6 text-center border-b border-border">
          <p className="text-4xl font-bold text-foreground">
            {type === "sent" ? "-" : "+"}${transaction.amount.toFixed(2)}
          </p>
          <p className="text-muted-foreground mt-1">{transaction.currency}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {type === "sent" ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">To</span>
              <div className="text-right">
                <p className="font-medium">{transaction.recipientName || "User"}</p>
                {transaction.recipientEmail && (
                  <p className="text-sm text-muted-foreground">{transaction.recipientEmail}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <span className="text-muted-foreground">From</span>
              <div className="text-right">
                <p className="font-medium">{transaction.senderName || "User"}</p>
                {transaction.senderEmail && (
                  <p className="text-sm text-muted-foreground">{transaction.senderEmail}</p>
                )}
              </div>
            </div>
          )}

          {transaction.description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Note</span>
              <span className="font-medium text-right max-w-[60%]">{transaction.description}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-mono text-sm">{transactionId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-muted/30 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            className="flex-1 rounded-full"
            onClick={onClose}
          >
            Done
          </Button>
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 text-center">
          <p className="text-xs text-muted-foreground">
            This is your official payment receipt from PayPal
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}