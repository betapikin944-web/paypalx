import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  name?: string;
  email?: string;
}

export function ProfileHeader({ name = "John Doe", email = "john@email.com" }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-card border-b border-border"
    >
      <Link to="/profile" className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center"
        >
          <span className="text-sm font-bold text-primary-foreground">
            {name.split(" ").map((n) => n[0]).join("")}
          </span>
        </motion.div>
        <div>
          <p className="font-semibold text-sm text-foreground">Hi, {name.split(" ")[0]}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-foreground" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Settings className="h-5 w-5 text-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
}
