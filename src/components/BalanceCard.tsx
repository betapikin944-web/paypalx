import { motion } from "framer-motion";
import { Eye, EyeOff, Plus, Calculator, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mx-4 -mt-2"
    >
      {/* Main Balance Card */}
      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-8 text-center">
          {/* PayPal Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.44A.859.859 0 015.79 1.7h7.104c2.35 0 4.104.55 5.207 1.635.522.513.906 1.108 1.139 1.768.247.7.333 1.526.258 2.457-.01.123-.025.25-.043.378-.019.138-.041.28-.067.427a9.174 9.174 0 01-.281 1.238c-.478 1.513-1.28 2.664-2.376 3.407-1.093.74-2.493 1.116-4.154 1.116H10.58a.858.858 0 00-.847.732l-.842 5.342-.24 1.52a.641.641 0 01-.633.533h-1.94l.001.001zm11.108-15.64c0-.004.001-.01.002-.014 0 .005 0 .01-.002.014z" fill="#003087"/>
                <path d="M21.333 5.697c-.02.123-.037.25-.056.378-.637 3.283-2.818 4.417-5.604 4.417h-1.418a.69.69 0 00-.68.584l-.728 4.603-.206 1.305a.362.362 0 00.357.419h2.5a.606.606 0 00.598-.513l.025-.128.472-2.998.03-.165a.606.606 0 01.598-.512h.377c2.442 0 4.354-.99 4.912-3.855.233-1.198.113-2.198-.505-2.901a2.414 2.414 0 00-.672-.534" fill="#0070BA"/>
              </svg>
            </div>
          </div>

          {/* Balance Title */}
          <h2 className="text-lg font-medium text-foreground mb-2">
            PayPal balance
          </h2>

          {/* Balance Amount */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              key={showBalance ? "visible" : "hidden"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h1 className="text-4xl font-light tracking-tight text-foreground">
                {showBalance ? formatBalance(balance) : "••••••"}
              </h1>
            </motion.div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Available text */}
          <p className="text-sm text-muted-foreground mb-6">
            Available in your PayPal Cash Plus balance
          </p>

          {/* Transfer Money Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 py-2.5 px-8 border-2 border-primary text-primary rounded-full font-medium text-sm hover:bg-primary/5 transition-colors mb-6"
          >
            Transfer Money
          </motion.button>

          {/* Quick Links */}
          <div className="flex items-center justify-center gap-8 pt-4 border-t border-border">
            <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" />
              Add a currency
            </button>
            <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
              <Calculator className="h-4 w-4" />
              Currency Calculator
            </button>
          </div>
        </div>
      </div>

      {/* Cash Card Section */}
      <div className="mt-4 bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-6 text-center">
          {/* Card Preview */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-[#003087] to-[#0070BA] flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="white">
                <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.44A.859.859 0 015.79 1.7h7.104c2.35 0 4.104.55 5.207 1.635.522.513.906 1.108 1.139 1.768.247.7.333 1.526.258 2.457-.01.123-.025.25-.043.378-.019.138-.041.28-.067.427a9.174 9.174 0 01-.281 1.238c-.478 1.513-1.28 2.664-2.376 3.407-1.093.74-2.493 1.116-4.154 1.116H10.58a.858.858 0 00-.847.732l-.842 5.342-.24 1.52a.641.641 0 01-.633.533h-1.94l.001.001z"/>
              </svg>
            </div>
          </div>
          
          <h3 className="text-base font-medium text-foreground mb-1">
            PayPal Cash Card
          </h3>
          <p className="text-sm text-muted-foreground">
            Your cash card accesses the funds in your PayPal balance
          </p>
        </div>
      </div>

      {/* Quick Action Buttons for Mobile */}
      <div className="flex gap-3 mt-4">
        <Link to="/send" className="flex-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary text-primary-foreground rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Send & Request
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
