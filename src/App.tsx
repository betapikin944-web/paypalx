import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Index from "./pages/Index";
import SendPage from "./pages/SendPage";
import RequestPage from "./pages/RequestPage";
import ScanPage from "./pages/ScanPage";
import PayPage from "./pages/PayPage";
import CardPage from "./pages/CardPage";
import InvestPage from "./pages/InvestPage";
import ActivityPage from "./pages/ActivityPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import LegalPage from "./pages/LegalPage";
import ProfileQrPage from "./pages/ProfileQrPage";
import LinkedDevicesPage from "./pages/LinkedDevicesPage";
import NotificationsSettingsPage from "./pages/NotificationsSettingsPage";
import SecurityPrivacyPage from "./pages/SecurityPrivacyPage";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import WalletPage from "./pages/WalletPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="max-w-md mx-auto min-h-screen relative">
            <Routes>
              <Route path="/welcome" element={<WelcomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/send" element={<ProtectedRoute><SendPage /></ProtectedRoute>} />
              <Route path="/request" element={<ProtectedRoute><RequestPage /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
              <Route path="/pay" element={<ProtectedRoute><PayPage /></ProtectedRoute>} />
              <Route path="/card" element={<ProtectedRoute><CardPage /></ProtectedRoute>} />
              <Route path="/invest" element={<ProtectedRoute><InvestPage /></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/settings/notifications" element={<ProtectedRoute><NotificationsSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/security" element={<ProtectedRoute><SecurityPrivacyPage /></ProtectedRoute>} />
              <Route path="/profile/qr" element={<ProtectedRoute><ProfileQrPage /></ProtectedRoute>} />
              <Route path="/profile/devices" element={<ProtectedRoute><LinkedDevicesPage /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><HelpCenterPage /></ProtectedRoute>} />
              <Route path="/legal" element={<ProtectedRoute><LegalPage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
