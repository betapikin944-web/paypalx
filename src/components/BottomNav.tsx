import { Home, CreditCard, ArrowUpDown, Receipt, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";

const leftItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: CreditCard, label: "Accounts", path: "/card" },
];

const rightItems = [
  { icon: Receipt, label: "Activity", path: "/activity" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const location = useLocation();

  const renderNavItem = (item: typeof leftItems[0]) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className="flex flex-col items-center gap-1 flex-1 py-2"
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="relative p-1.5"
        >
          <item.icon
            className={`h-6 w-6 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </motion.div>
        <span
          className={`text-[10px] font-medium transition-colors ${
            isActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {item.label}
        </span>
        {isActive && (
          <motion.div
            layoutId="nav-underline"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </Link>
    );
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border"
    >
      <div className="container max-w-md mx-auto flex items-end justify-around relative pb-safe">
        {/* Left items */}
        {leftItems.map(renderNavItem)}

        {/* Center raised Send/Request button */}
        <Link
          to="/send"
          className="flex flex-col items-center gap-1 flex-1 -mt-4 relative"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <ArrowUpDown className="h-6 w-6 text-primary-foreground" />
          </motion.div>
          <span
            className={`text-[10px] font-medium mt-0.5 ${
              location.pathname === "/send"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            Send/Request
          </span>
          {location.pathname === "/send" && (
            <motion.div
              layoutId="nav-underline"
              className="w-8 h-0.5 bg-primary rounded-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>

        {/* Right items */}
        {rightItems.map(renderNavItem)}
      </div>
    </motion.nav>
  );
}
