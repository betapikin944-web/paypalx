import { motion } from "framer-motion";
import { Send, Download, QrCode, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: Send, label: "Send", path: "/send", color: "gradient-primary" },
  { icon: Download, label: "Request", path: "/request", color: "bg-secondary" },
  { icon: QrCode, label: "Scan", path: "/scan", color: "bg-secondary" },
  { icon: MoreHorizontal, label: "More", path: "/more", color: "bg-secondary" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-4 gap-4 px-4"
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
              className={`w-14 h-14 rounded-full flex items-center justify-center ${action.color} ${
                action.color === "gradient-primary" ? "glow-sm" : ""
              }`}
            >
              <action.icon
                className={`h-6 w-6 ${
                  action.color === "gradient-primary" ? "text-primary-foreground" : "text-foreground"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-muted-foreground">{action.label}</span>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}
