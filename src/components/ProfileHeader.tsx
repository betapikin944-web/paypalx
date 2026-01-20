import { motion } from "framer-motion";
import { Bell, Settings, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileHeaderProps {
  name?: string;
  cashtag?: string;
}

export function ProfileHeader({ name = "John Doe", cashtag = "$johndoe" }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4"
    >
      <Link to="/profile" className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center glow-sm"
        >
          <span className="text-sm font-bold text-primary-foreground">
            {name.split(" ").map((n) => n[0]).join("")}
          </span>
        </motion.div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{cashtag}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-muted"
        >
          <Bell className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-muted"
        >
          <Settings className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
