import { BottomNav } from "@/components/BottomNav";
import { BalanceCard } from "@/components/BalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { TransactionList } from "@/components/TransactionList";
import { ProfileHeader } from "@/components/ProfileHeader";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen pb-24">
      <ProfileHeader name="John Doe" cashtag="$johndoe" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Glow effect behind balance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <BalanceCard balance={2847.50} />
      </motion.div>

      <QuickActions />
      
      <TransactionList />
      
      <BottomNav />
    </div>
  );
};

export default Index;
