import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, Link2, QrCode, BarChart3 } from "lucide-react";

interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Sharp Links. Instant QR.
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-display font-black text-zinc-950 leading-[0.9] mb-8"
          >
            The <span className="text-accent">Sharpest</span> Way to Share Your World.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-600 mb-10 max-w-2xl mx-auto"
          >
            Porcu.One combines high-speed URL shortening with beautiful, customizable QR codes and deep analytics. All in one sharp package.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={onStart}
              className="group bg-primary text-white px-8 py-4 rounded-2xl text-lg font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all brutal-shadow-hover"
            >
              Start Shortening Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white text-zinc-950 px-8 py-4 rounded-2xl text-lg font-bold border border-zinc-200 hover:bg-zinc-50 transition-all">
              View Demo
            </button>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 to-transparent z-10 h-40 bottom-0 top-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Link2 className="w-6 h-6" />}
              title="URL Shortener"
              description="Create memorable, short links in seconds. Track every click with precision."
            />
            <FeatureCard 
              icon={<QrCode className="w-6 h-6" />}
              title="QR Generator"
              description="Generate custom QR codes for any link. High resolution and ready for print."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Deep Analytics"
              description="Understand your audience with real-time data on location, devices, and more."
            />
          </div>
        </motion.div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 text-accent">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
