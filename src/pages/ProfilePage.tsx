import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Shield,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  QrCode,
  Smartphone,
} from "lucide-react";
const profileSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Personal Info", path: "/profile/info" },
      { icon: QrCode, label: "My QR Code", path: "/profile/qr" },
      { icon: Smartphone, label: "Linked Devices", path: "/profile/devices" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Bell, label: "Notifications", path: "/settings/notifications" },
      { icon: Shield, label: "Security & Privacy", path: "/settings/security" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", path: "/help" },
      { icon: FileText, label: "Legal", path: "/legal" },
    ],
  },
];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/welcome');
  };

  const userEmail = user?.email || 'user@example.com';
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-24">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-24 h-24 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center glow-primary"
        >
          <span className="text-3xl font-bold text-primary-foreground">{userInitials}</span>
        </motion.div>
        <h1 className="text-2xl font-bold">{userEmail.split('@')[0]}</h1>
        <p className="text-muted-foreground">{userEmail}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 px-4 mb-8"
      >
        {[
          { label: "Sent", value: "$12,450" },
          { label: "Received", value: "$8,920" },
          { label: "Invested", value: "$4,582" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl bg-card text-center">
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Settings Sections */}
      {profileSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + sectionIndex * 0.05 }}
          className="mb-6"
        >
          <h2 className="px-4 text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            {section.title}
          </h2>
          <div className="mx-4 rounded-2xl bg-card overflow-hidden">
            {section.items.map((item, index) => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                  index < section.items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="px-4"
      >
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card hover:bg-destructive/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <span className="flex-1 text-left font-medium text-destructive">Log Out</span>
        </motion.button>
      </motion.div>

      <BottomNav />
    </div>
  );
}
