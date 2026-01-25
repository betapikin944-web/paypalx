import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSearchProfiles, Profile } from "@/hooks/useProfile";
import { useSendMoney } from "@/hooks/useTransactions";
import { useBalance } from "@/hooks/useBalance";

export function SendMoney() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState<Profile | null>(null);
  const [step, setStep] = useState<"select" | "amount">("select");

  const { data: searchResults, isLoading: isSearching } = useSearchProfiles(searchTerm);
  const { data: balance } = useBalance();
  const sendMoney = useSendMoney();

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

  const handlePay = async () => {
    if (!selectedContact || !amount) return;
    
    const amountNum = parseFloat(amount);
    if (amountNum <= 0) return;
    
    await sendMoney.mutateAsync({
      recipientId: selectedContact.user_id,
      amount: amountNum,
      description: `Payment to ${selectedContact.display_name || selectedContact.email || 'user'}`,
    });

    navigate('/');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-white border-b border-border">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => step === "amount" ? setStep("select") : navigate("/")}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">
          {step === "select" ? "Send Money" : `To ${selectedContact?.display_name || selectedContact?.email || 'User'}`}
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
                  placeholder="Search by email, name, or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-muted border-0 rounded-xl"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Enter email, name, or phone number
              </p>
            </div>

            {/* Search Results */}
            <div className="px-4 flex-1">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">RESULTS</h2>
                  <div className="space-y-2">
                    {searchResults.map((profile, index) => (
                      <motion.button
                        key={profile.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContactSelect(profile)}
                        className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-white">
                              {getInitials(profile.display_name)}
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{profile.display_name || profile.email || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{profile.email || profile.phone_number || 'No contact'}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              ) : searchTerm.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Search for a user to send money
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="amount"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex-1 flex flex-col"
          >
            {/* Amount Display */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold mb-2 text-foreground"
              >
                ${amount || "0"}
              </motion.div>
              {selectedContact && (
                <p className="text-muted-foreground">
                  to {selectedContact.display_name || selectedContact.email || 'User'}
                </p>
              )}
              {balance && (
                <p className="text-sm text-muted-foreground mt-2">
                  Available: ${Number(balance.amount).toFixed(2)}
                </p>
              )}
            </div>

            {/* Numpad */}
            <div className="p-4 pb-8">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((num) => (
                  <motion.button
                    key={num}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleNumberPress(num)}
                    className="h-16 rounded-2xl bg-muted text-2xl font-semibold hover:bg-muted/80 transition-colors"
                  >
                    {num}
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="h-16 rounded-2xl bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>
              <Button
                disabled={!amount || parseFloat(amount) === 0 || sendMoney.isPending}
                onClick={handlePay}
                className="w-full h-14 text-lg font-semibold rounded-full bg-primary hover:bg-primary-dark"
              >
                {sendMoney.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  `Pay $${amount || "0"}`
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
