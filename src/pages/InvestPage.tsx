import { motion } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";
import { TrendingUp, TrendingDown, Bitcoin, DollarSign, Coins } from "lucide-react";

const stocks = [
  { symbol: "BTC", name: "Bitcoin", price: 43250.00, change: 2.45, icon: Bitcoin },
  { symbol: "ETH", name: "Ethereum", price: 2280.50, change: -1.23, icon: Coins },
  { symbol: "AAPL", name: "Apple Inc.", price: 185.92, change: 0.87, icon: DollarSign },
  { symbol: "TSLA", name: "Tesla", price: 248.48, change: -2.15, icon: DollarSign },
  { symbol: "GOOGL", name: "Alphabet", price: 140.25, change: 1.32, icon: DollarSign },
];

export default function InvestPage() {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="p-4">
        <h1 className="text-2xl font-bold">Investing</h1>
        <p className="text-muted-foreground text-sm">Buy stocks & crypto</p>
      </div>

      {/* Portfolio Value */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 p-6 rounded-2xl bg-card mb-6"
      >
        <p className="text-muted-foreground text-sm mb-1">Portfolio Value</p>
        <h2 className="text-4xl font-bold mb-2">$4,582.30</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-primary text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            +$127.45
          </span>
          <span className="text-primary text-sm">(+2.86%)</span>
          <span className="text-muted-foreground text-sm">Today</span>
        </div>
      </motion.div>

      {/* Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 h-40 rounded-2xl bg-card mb-6 flex items-center justify-center overflow-hidden relative"
      >
        <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(138 100% 42%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(138 100% 42%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,120 C50,100 100,140 150,80 C200,20 250,60 300,40 C350,20 380,50 400,30 L400,160 L0,160 Z"
            fill="url(#chartGradient)"
          />
          <path
            d="M0,120 C50,100 100,140 150,80 C200,20 250,60 300,40 C350,20 380,50 400,30"
            fill="none"
            stroke="hsl(138 100% 42%)"
            strokeWidth="2"
          />
        </svg>
      </motion.div>

      {/* Stocks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-4"
      >
        <h2 className="text-lg font-semibold mb-4">Top Movers</h2>
        <div className="space-y-2">
          {stocks.map((stock, index) => (
            <motion.button
              key={stock.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-muted transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <stock.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">{stock.symbol}</p>
                <p className="text-sm text-muted-foreground">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${stock.price.toLocaleString()}</p>
                <p
                  className={`text-sm flex items-center gap-1 justify-end ${
                    stock.change >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}%
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}
