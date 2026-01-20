import { motion } from "framer-motion";
import { Wifi, Lock } from "lucide-react";

interface CashCardProps {
  lastFour?: string;
  cardHolder?: string;
}

export function CashCard({ lastFour = "4829", cardHolder = "JOHN DOE" }: CashCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="relative aspect-[1.586/1] w-full max-w-sm mx-auto rounded-2xl gradient-primary glow-primary overflow-hidden p-6 flex flex-col justify-between"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 250">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Card Header */}
      <div className="relative flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-primary-foreground tracking-wider">CASH</h3>
          <p className="text-xs text-primary-foreground/70 font-medium">CARD</p>
        </div>
        <Wifi className="h-6 w-6 text-primary-foreground/80 rotate-90" />
      </div>

      {/* Card Number */}
      <div className="relative">
        <p className="text-lg font-mono text-primary-foreground/90 tracking-widest">
          •••• •••• •••• {lastFour}
        </p>
      </div>

      {/* Card Footer */}
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-xs text-primary-foreground/60 mb-1">CARD HOLDER</p>
          <p className="text-sm font-semibold text-primary-foreground tracking-wider">{cardHolder}</p>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary-foreground/60" />
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/30" />
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
