import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const recentContacts = [
  { id: "1", name: "Alex Johnson", username: "$alex", avatar: "AJ" },
  { id: "2", name: "Sarah Miller", username: "$sarah_m", avatar: "SM" },
  { id: "3", name: "Mike Chen", username: "$mikechen", avatar: "MC" },
  { id: "4", name: "Emma Wilson", username: "$emmaw", avatar: "EW" },
  { id: "5", name: "David Brown", username: "$dbrown", avatar: "DB" },
];

export function SendMoney() {
  const [amount, setAmount] = useState("");
  const [selectedContact, setSelectedContact] = useState<typeof recentContacts[0] | null>(null);
  const [step, setStep] = useState<"select" | "amount">("select");

  const handleNumberPress = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount((prev) => prev + num);
  };

  const handleDelete = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleContactSelect = (contact: typeof recentContacts[0]) => {
    setSelectedContact(contact);
    setStep("amount");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
        </Link>
        <h1 className="text-xl font-semibold">
          {step === "select" ? "Send Money" : `To ${selectedContact?.name}`}
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
            <div className="px-4 mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Name, $cashtag, phone, or email"
                  className="pl-12 h-12 bg-muted border-0 rounded-xl"
                />
              </div>
            </div>

            {/* Recent Contacts */}
            <div className="px-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">RECENT</h2>
              <div className="space-y-2">
                {recentContacts.map((contact, index) => (
                  <motion.button
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleContactSelect(contact)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-foreground">
                        {contact.avatar}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.username}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
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
                className="text-6xl font-bold mb-2"
              >
                ${amount || "0"}
              </motion.div>
              {selectedContact && (
                <p className="text-muted-foreground">
                  to {selectedContact.username}
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
                disabled={!amount || parseFloat(amount) === 0}
                className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary glow-sm border-0"
              >
                Pay ${amount || "0"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
