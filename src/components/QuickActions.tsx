import { motion } from "framer-motion";
import { Send, Download, QrCode, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: Send, label: "Send", path: "/send", primary: true },
  { icon: Download, label: "Request", path: "/request", primary: false },
  { icon: QrCode, label: "Scan", path: "/scan", primary: false },
  { icon: CreditCard, label: "Pay", path: "/pay", primary: false },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-4 gap-3 px-4 py-6"
    >
      {actions.map((action, index) => (
        <Link key={action.label} to={action.path}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="action-button"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-card ${
                action.primary
                  ? "gradient-primary"
                  : "bg-card border border-border"
              }`}
            >
              <action.icon
                className={`h-6 w-6 ${
                  action.primary ? "text-primary-foreground" : "text-primary"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}
