import { motion } from "framer-motion";

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
      className="relative aspect-[1.586/1] w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-lg"
      style={{
        background: "linear-gradient(135deg, hsl(218 100% 26%) 0%, hsl(220 80% 40%) 40%, hsl(205 100% 50%) 100%)",
      }}
    >
      {/* Large P watermark */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="140" height="160" viewBox="0 0 140 160" fill="none" className="opacity-30">
          <path
            d="M30 140V20h40c25 0 45 15 45 38s-20 38-45 38H55v44H30z"
            fill="url(#p-gradient)"
          />
          <defs>
            <linearGradient id="p-gradient" x1="30" y1="20" x2="115" y2="140" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(195 100% 60%)" />
              <stop offset="100%" stopColor="hsl(40 100% 60%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Card content */}
      <div className="relative h-full flex flex-col justify-between p-5">
        {/* Top row: PP logo + label */}
        <div className="flex items-center gap-2">
          {/* PayPal "PP" mark */}
          <div className="flex items-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M8 22V6h8c5 0 9 3 9 7.5S21 21 16 21h-4v1H8z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <span className="text-primary-foreground font-semibold text-base tracking-wide">
            Debit Card
          </span>
        </div>

        {/* Mastercard logo */}
        <div className="flex items-center gap-0 mt-auto mb-1">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-red-500 opacity-90" />
            <div className="w-7 h-7 rounded-full bg-yellow-400 opacity-80" />
          </div>
        </div>

        {/* Card number (last four) */}
        <div className="flex items-end justify-between">
          <p className="text-primary-foreground font-semibold text-lg tracking-widest flex items-center gap-1">
            <span className="text-primary-foreground/60 text-2xl leading-none">••</span>
            <span>{lastFour}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
