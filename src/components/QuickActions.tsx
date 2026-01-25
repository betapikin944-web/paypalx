import { motion } from "framer-motion";
import { Send, Download, QrCode, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: Send, label: "Send", path: "/send", color: "bg-primary" },
  { icon: Download, label: "Request", path: "/request", color: "bg-emerald-500" },
  { icon: QrCode, label: "Scan", path: "/scan", color: "bg-violet-500" },
  { icon: CreditCard, label: "Pay", path: "/pay", color: "bg-amber-500" },
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