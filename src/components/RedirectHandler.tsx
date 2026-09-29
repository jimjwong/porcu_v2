import React, { useEffect, useState } from "react";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { doc, getDoc, updateDoc, increment, collection, addDoc } from "firebase/firestore";
import { motion } from "motion/react";
import { Zap, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";

export default function RedirectHandler() {
  const [error, setError] = useState<string | null>(null);
  const path = window.location.pathname;
  const isRedirect = path.startsWith("/r/");
  const shortId = isRedirect ? path.split("/r/")[1] : null;

  useEffect(() => {
    if (!shortId) return;

    const performRedirect = async () => {
      try {
        const linkDoc = await getDoc(doc(db, "links", shortId));
        
        if (!linkDoc.exists()) {
          setError("Link not found. It may have been deleted or expired.");
          return;
        }

        const linkData = linkDoc.data();
        
        // Record click analytics (client-side)
        const clickId = nanoid();
        await addDoc(collection(db, "links", shortId, "clicks"), {
          id: clickId,
          linkId: shortId,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || "Direct",
          // In a real app, we'd use an IP-to-Geo service here
          country: "Unknown",
          city: "Unknown"
        });

        // Increment total clicks
        await updateDoc(doc(db, "links", shortId), {
          clicks: increment(1)
        });

        // Perform redirect
        window.location.href = linkData.originalUrl;
      } catch (err) {
        console.error("Redirect error:", err);
        setError("An error occurred while redirecting. Please try again.");
      }
    };

    performRedirect();
  }, [shortId]);

  if (!isRedirect) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <div className="bg-accent p-4 rounded-3xl shadow-xl shadow-accent/20">
          <Zap className="w-12 h-12 text-white fill-white" />
        </div>
      </motion.div>

      {error ? (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="text-2xl font-display font-black mb-4">Oops!</h2>
          <p className="text-zinc-500 mb-8 max-w-md mx-auto">{error}</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="bg-zinc-950 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Back to Porcu.One
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <h2 className="text-2xl font-display font-black mb-2">Redirecting...</h2>
          <p className="text-zinc-500 mb-8">You're being whisked away to your destination.</p>
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </motion.div>
      )}

      <div className="absolute bottom-12 text-zinc-300 font-display font-bold text-xl tracking-tight">
        Porcu.One
      </div>
    </div>
  );
}
