import { BottomNav } from "@/components/BottomNav";
import { BalanceCard } from "@/components/BalanceCard";
import { QuickActions } from "@/components/QuickActions";
import { TransactionList } from "@/components/TransactionList";
import { ProfileHeader } from "@/components/ProfileHeader";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <ProfileHeader name="John Doe" email="john.doe@email.com" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-4"
      >
        <BalanceCard balance={2847.50} />
      </motion.div>

      <QuickActions />
      
      <TransactionList />
      
      <BottomNav />
    </div>
  );
};

export default Index;
