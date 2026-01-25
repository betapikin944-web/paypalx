import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  name?: string;
  email?: string;
}

export function ProfileHeader({ name = "User", email = "" }: ProfileHeaderProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || email.slice(0, 2).toUpperCase() || "U";

  const displayName = name || email.split('@')[0] || "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-primary text-primary-foreground"
    >
      <div className="flex items-center justify-between p-4">
        <Link to="/profile" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30"
          >
            <span className="text-sm font-bold text-white">
              {initials}
            </span>
          </motion.div>
          <div>
            <p className="font-semibold text-base text-white">Hello, {displayName.split(" ")[0]}</p>
            <p className="text-xs text-white/70">{email}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <Bell className="h-5 w-5 text-white" />
          </motion.button>
          <Link to="/settings">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="p-2.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <Settings className="h-5 w-5 text-white" />
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}