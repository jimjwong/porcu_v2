import { motion } from "motion/react";
import { Zap, Shield, Globe, Cpu, Smartphone, BarChart3 } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Our global edge network ensures your redirects happen in milliseconds, anywhere in the world."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Advanced link protection and privacy controls to keep your data and your users safe."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Track visitors from every corner of the globe with detailed geographical analytics."
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Smart Targeting",
      description: "Redirect users based on their device, location, or language for a personalized experience."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Optimized",
      description: "QR codes that work perfectly on every device, from the latest iPhone to older Androids."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Insights",
      description: "Watch your traffic grow with live analytics updates. No more waiting for daily reports."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-black mb-6">Built for the Modern Web.</h2>
          <p className="text-xl text-zinc-600">
            Porcu.One isn't just a link shortener. It's a complete toolkit for digital marketers and creators.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-accent group-hover:text-white transition-all mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
