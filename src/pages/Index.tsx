import { BottomNav } from "@/components/BottomNav";
import { BalanceCard } from "@/components/BalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { TransactionList } from "@/components/TransactionList";
import { ProfileHeader } from "@/components/ProfileHeader";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useBalance } from "@/hooks/useBalance";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: balance, isLoading: balanceLoading } = useBalance();

  if (profileLoading || balanceLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const balanceAmount = balance?.amount ? Number(balance.amount) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <ProfileHeader name={displayName} email={email} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-4"
      >
        <BalanceCard balance={balanceAmount} />
      </motion.div>

      <QuickActions />
      
      <TransactionList />
      
      <BottomNav />
    </div>
  );
};

export default Index;
