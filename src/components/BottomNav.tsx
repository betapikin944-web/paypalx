import { Home, ArrowLeftRight, CreditCard, Bitcoin, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: ArrowLeftRight, label: "Activity", path: "/activity" },
  { icon: CreditCard, label: "Card", path: "/card" },
  { icon: Bitcoin, label: "Invest", path: "/invest" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/30"
    >
      <div className="container flex items-center justify-around py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? "nav-item-active" : ""}`}
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative p-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className="h-6 w-6 relative z-10" />
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
