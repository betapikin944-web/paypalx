import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Loader2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchProfiles, Profile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function RequestPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null);
  const [step, setStep] = useState<"select" | "amount" | "success">("select");
  const [copied, setCopied] = useState(false);

  const { data: searchResults, isLoading: isSearching } = useSearchProfiles(searchTerm);

  const handleNumberPress = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleContactSelect = (contact: Profile) => {
    setSelectedContact(contact);
    setStep("amount");
  };

  const handleRequest = () => {
    if (!selectedContact || !amount) return;
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) return;
    setStep("success");
  };

  const handleCopyLink = () => {
    const requestLink = `${window.location.origin}/pay?to=${selectedContact?.email}&amount=${amount}`;
    navigator.clipboard.writeText(requestLink);
    setCopied(true);
    toast.success("Payment request link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-[#0070BA] text-white">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => step === "amount" ? setStep("select") : step === "success" ? setStep("amount") : navigate("/")}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">
          {step === "select" ? "Request Money" : step === "amount" ? `From ${selectedContact?.display_name || selectedContact?.email?.split('@')[0] || 'User'}` : "Request Sent"}
        </h1>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" ? (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Search */}
            <div className="px-4 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter email address"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-muted border-0 rounded-2xl text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Search by email, name, or phone number
              </p>
            </div>

            {/* Search Results */}
            <div className="px-4 flex-1">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0070BA]" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Results</h2>
                  <div className="space-y-2">
                    {searchResults.map((profile, index) => (
                      <motion.button
                        key={profile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContactSelect(profile)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-[#0070BA]/50 transition-all"
                      >
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#003087] to-[#0070BA] flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-base font-bold text-white">
                              {getInitials(profile.display_name, profile.email)}
                            </span>
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-foreground">{profile.display_name || profile.email?.split('@')[0] || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{profile.email || profile.phone_number || 'No contact info'}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : searchTerm.length >= 2 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No users found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-[#0070BA]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-[#0070BA]" />
                  </div>
                  <p className="text-foreground font-medium">Find someone to request from</p>
                  <p className="text-sm text-muted-foreground mt-1">Enter their email or name above</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : step === "amount" ? (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Recipient Info */}
            <div className="px-4 py-6 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003087] to-[#0070BA] flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {getInitials(selectedContact?.display_name || null, selectedContact?.email || null)}
                </span>
              </div>
              <div>
                <p className="font-semibold">{selectedContact?.display_name || selectedContact?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-muted-foreground">{selectedContact?.email}</p>
              </div>
            </div>

            {/* Amount Display */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold mb-2 text-foreground"
              >
                ${amount || "0"}
              </motion.div>
              <p className="text-sm text-muted-foreground">Amount to request</p>
            </div>

            {/* Numpad */}
            <div className="p-4 pb-8 bg-muted/30">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNumberPress(num)}
                    className="h-16 rounded-2xl bg-card text-2xl font-semibold hover:bg-muted transition-colors border border-border"
                  >
                    {num}
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="h-16 rounded-2xl bg-card hover:bg-muted transition-colors flex items-center justify-center border border-border"
                >
                  ←
                </motion.button>
              </div>
              <Button
                disabled={!amount || parseFloat(amount) === 0}
                onClick={handleRequest}
                className="w-full h-14 text-lg font-semibold rounded-full bg-[#0070BA] hover:bg-[#003087]"
              >
                Request ${amount || "0"}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Created!</h2>
            <p className="text-muted-foreground mb-6">
              Request ${amount} from {selectedContact?.display_name || selectedContact?.email?.split('@')[0]}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              {selectedContact?.email}
            </p>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="mb-4 rounded-full"
            >
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied!" : "Copy Payment Link"}
            </Button>
            <Button
              onClick={() => navigate("/")}
              className="w-full h-14 text-lg font-semibold rounded-full bg-[#0070BA] hover:bg-[#003087]"
            >
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
