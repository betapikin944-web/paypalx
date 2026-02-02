import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useMemo } from "react";
import {
  Shield,
  Bell,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  QrCode,
  Smartphone,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const profileSections = [
  {
    title: "Account",
    items: [
      { icon: Settings, label: "Edit Profile", path: "/settings" },
      { icon: Wallet, label: "Cards & Withdrawals", path: "/wallet" },
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
  const { data: profile } = useProfile();
  const { data: transactions } = useTransactions();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!transactions || !user) {
      return { sent: 0, received: 0 };
    }

    return transactions.reduce(
      (acc, t) => {
        if (t.sender_id === user.id) {
          acc.sent += Number(t.amount);
        } else if (t.recipient_id === user.id) {
          acc.received += Number(t.amount);
        }
        return acc;
      },
      { sent: 0, received: 0 }
    );
  }, [transactions, user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/welcome');
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userInitials = profile?.display_name 
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-center bg-white border-b border-border"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-light mx-auto mb-4 flex items-center justify-center shadow-lg"
        >
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-white">{userInitials}</span>
          )}
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
        <p className="text-muted-foreground">{userEmail}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 px-4 py-4"
      >
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <p className="text-lg font-bold text-foreground">${stats.sent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Total Sent</p>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <p className="text-lg font-bold text-foreground">${stats.received.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Total Received</p>
        </div>
      </motion.div>

      {/* Admin Section */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-6"
        >
          <h2 className="px-4 text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Administration
          </h2>
          <div className="mx-4 rounded-2xl bg-card border border-border overflow-hidden">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">Admin Dashboard</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </motion.button>
          </div>
        </motion.div>
      )}

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
          <div className="mx-4 rounded-2xl bg-card border border-border overflow-hidden">
            {section.items.map((item, index) => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors ${
                  index < section.items.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
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
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:bg-destructive/10 transition-colors group"
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
