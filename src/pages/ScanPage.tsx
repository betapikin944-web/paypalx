import { motion } from "framer-motion";
import { ArrowLeft, QrCode, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ScanPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-background"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-[#142C8E] text-white">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <h1 className="text-xl font-semibold">Scan QR Code</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* QR Scanner Placeholder */}
        <div className="w-64 h-64 border-4 border-dashed border-[#142C8E] rounded-3xl flex items-center justify-center mb-8 relative">
          <div className="absolute inset-4 border-2 border-[#142C8E]/30 rounded-2xl"></div>
          <Camera className="h-16 w-16 text-[#142C8E]/50" />
        </div>

        <h2 className="text-xl font-semibold mb-2">Scan a QR Code</h2>
        <p className="text-muted-foreground text-center mb-8 max-w-xs">
          Point your camera at a PayPal QR code to send or receive money
        </p>

        <div className="w-full max-w-xs space-y-3">
          <Button
            onClick={() => navigate("/send")}
            className="w-full h-14 rounded-full bg-[#142C8E] hover:bg-[#003087]"
          >
            <QrCode className="h-5 w-5 mr-2" />
            Show My QR Code
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="w-full h-14 rounded-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
