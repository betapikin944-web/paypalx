import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRightLeft, Building2, CreditCard, ChevronDown, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { LinkCardDialog } from "./LinkCardDialog";
import { WithdrawalDialog } from "./WithdrawalDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BalanceCardProps {
  balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [showLinkCard, setShowLinkCard] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);

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
        <div className="p-5 text-center">
          {/* PayPal Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.44A.859.859 0 015.79 1.7h7.104c2.35 0 4.104.55 5.207 1.635.522.513.906 1.108 1.139 1.768.247.7.333 1.526.258 2.457-.01.123-.025.25-.043.378-.019.138-.041.28-.067.427a9.174 9.174 0 01-.281 1.238c-.478 1.513-1.28 2.664-2.376 3.407-1.093.74-2.493 1.116-4.154 1.116H10.58a.858.858 0 00-.847.732l-.842 5.342-.24 1.52a.641.641 0 01-.633.533h-1.94l.001.001zm11.108-15.64c0-.004.001-.01.002-.014 0 .005 0 .01-.002.014z" fill="#003087"/>
                <path d="M21.333 5.697c-.02.123-.037.25-.056.378-.637 3.283-2.818 4.417-5.604 4.417h-1.418a.69.69 0 00-.68.584l-.728 4.603-.206 1.305a.362.362 0 00.357.419h2.5a.606.606 0 00.598-.513l.025-.128.472-2.998.03-.165a.606.606 0 01.598-.512h.377c2.442 0 4.354-.99 4.912-3.855.233-1.198.113-2.198-.505-2.901a2.414 2.414 0 00-.672-.534" fill="#0070BA"/>
              </svg>
            </div>
          </div>

          {/* Balance Title */}
          <h2 className="text-xs font-medium text-muted-foreground mb-1">
            PayPal balance
          </h2>

          {/* Balance Amount */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <motion.div
              key={showBalance ? "visible" : "hidden"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {showBalance ? formatBalance(balance) : "••••••"}
              </h1>
            </motion.div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          </div>

          {/* Available text */}
          <p className="text-[10px] text-muted-foreground mb-4">
            Available in your PayPal Cash Plus balance
          </p>

          {/* Transfer Money Button */}
          <Link to="/send" className="inline-flex">
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 py-2 px-6 border border-primary text-primary rounded-full font-medium text-xs hover:bg-primary/5 transition-colors mb-4"
            >
              Transfer Money
            </motion.button>
          </Link>

          {/* Quick Links - Transfer, Withdrawal & Cards */}
          <div className="flex items-center justify-center gap-5 pt-3 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-[11px] font-medium">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Transfer
                  <ChevronDown className="h-2.5 w-2.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem asChild>
                  <Link to="/send" className="flex items-center gap-2 text-xs">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Send to PayPal User
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setShowWithdrawal(true)}
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-[11px] font-medium"
            >
              <Building2 className="h-3.5 w-3.5" />
              Withdrawal
            </button>

            <button
              onClick={() => setShowLinkCard(true)}
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors text-[11px] font-medium"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Cash Card Section */}
      <div className="mt-3 bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="p-4 text-center">
          {/* Card Preview */}
          <div className="flex justify-center mb-3">
            <div className="w-16 h-10 rounded-lg bg-gradient-to-br from-[#003087] to-[#0070BA] flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.44A.859.859 0 015.79 1.7h7.104c2.35 0 4.104.55 5.207 1.635.522.513.906 1.108 1.139 1.768.247.7.333 1.526.258 2.457-.01.123-.025.25-.043.378-.019.138-.041.28-.067.427a9.174 9.174 0 01-.281 1.238c-.478 1.513-1.28 2.664-2.376 3.407-1.093.74-2.493 1.116-4.154 1.116H10.58a.858.858 0 00-.847.732l-.842 5.342-.24 1.52a.641.641 0 01-.633.533h-1.94l.001.001z"/>
              </svg>
            </div>
          </div>
          
          <h3 className="text-xs font-medium text-foreground mb-0.5">
            PayPal Cash Card
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Your cash card accesses the funds in your PayPal balance
          </p>
        </div>
      </div>

      {/* Quick Action Buttons for Mobile */}
      <div className="flex gap-2 mt-3">
        <Link to="/send" className="flex-1">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-primary text-primary-foreground rounded-full font-medium text-xs hover:opacity-90 transition-opacity"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Send & Request
          </motion.button>
        </Link>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLinkCard(true)}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-secondary text-secondary-foreground rounded-full font-medium text-xs hover:opacity-90 transition-opacity"
        >
          <Wallet className="h-3.5 w-3.5" />
          Add Money
        </motion.button>
      </div>

      {/* Dialogs */}
      <LinkCardDialog open={showLinkCard} onOpenChange={setShowLinkCard} />
      <WithdrawalDialog open={showWithdrawal} onOpenChange={setShowWithdrawal} />
    </motion.div>
  );
}
