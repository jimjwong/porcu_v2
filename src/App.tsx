import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Dashboard from "./components/Dashboard";
import RedirectHandler from "./components/RedirectHandler";
import { motion, AnimatePresence } from "motion/react";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  const [page, setPage] = useState<"home" | "dashboard">("home");

  return (
    <div className="min-h-screen bg-zinc-50">
      <RedirectHandler />
      <Navbar onNavigate={setPage} currentPage={page} />
      
      <main>
        <AnimatePresence mode="wait">
          {page === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Hero onStart={() => setPage("dashboard")} />
              <Features />
              <footer className="py-12 border-t border-zinc-100 bg-white">
                <div className="container mx-auto px-4 text-center">
                  <p className="text-zinc-400 text-sm">
                    © 2026 Porcu.One. All rights reserved. Sharp links for sharp people.
                  </p>
                </div>
              </footer>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Toaster />
    </div>
  );
}


