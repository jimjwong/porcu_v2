import { motion } from "motion/react";
import { Link2, QrCode, BarChart3, Zap } from "lucide-react";

interface NavbarProps {
  onNavigate: (page: "home" | "dashboard") => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass flex items-center gap-8 px-6 py-3 rounded-full border border-zinc-200 shadow-sm"
      >
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate("home")}
        >
          <div className="bg-accent p-1.5 rounded-lg">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">Porcu.One</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <button 
            onClick={() => onNavigate("home")}
            className={`hover:text-accent transition-colors ${currentPage === "home" ? "text-accent" : ""}`}
          >
            Features
          </button>
          <button className="hover:text-accent transition-colors">Pricing</button>
          <button className="hover:text-accent transition-colors">Enterprise</button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate("dashboard")}
            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all"
          >
            Get Started
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
