import { motion } from "framer-motion";
import { Send, Download, QrCode, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: Send, label: "Send", path: "/send", color: "bg-[#003087]" },
  { icon: Download, label: "Request", path: "/request", color: "bg-[#0070BA]" },
  { icon: QrCode, label: "Scan", path: "/scan", color: "bg-[#142C8E]" },
  { icon: CreditCard, label: "Pay", path: "/pay", color: "bg-[#009CDE]" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-4 gap-2 px-4 py-6"
    >
      {actions.map((action, index) => (
        <Link key={action.label} to={action.path}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${action.color}`}
            >
              <action.icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-medium text-foreground">{action.label}</span>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}