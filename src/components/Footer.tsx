"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export function Footer() {
  const [email, setEmail] = useState("");
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !db) return;

    const entryRef = doc(collection(db, "central_hub"));
    setDocumentNonBlocking(entryRef, {
      id: entryRef.id,
      type: "newsletter",
      userId: user?.uid || "anonymous",
      userEmail: email,
      timestamp: new Date().toISOString()
    }, { merge: true });
    
    setEmail("");
    toast({ title: "Subscribed successfully!" });
  };

  return (
    <footer id="footer" className="py-20 bg-background border-t border-white/5">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-4 gap-16 mb-16 pb-16 border-b border-white/5">
          <div className="col-span-2">
            <h2 className="text-3xl font-headline font-bold tracking-[0.3em] mb-4 text-primary">NECTAR</h2>
            <p className="text-foreground/20 text-[10px] lowercase tracking-[0.4em] mb-8 font-medium">Fresh Cold-Pressed Juice</p>
            <div className="max-w-sm">
              <h4 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.3em] mb-4">Newsletter Signup</h4>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <Input 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 border-white/5 text-[10px] tracking-widest text-foreground"
                />
                <Button type="submit" size="icon" className="bg-transparent border border-primary/20 text-primary hover:bg-primary/5 transition-all">
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em] mb-6">Navigate</h4>
            <ul className="space-y-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
              <li><a href="#product" className="hover:text-primary transition-colors">Product</a></li>
              <li><a href="#ingredients" className="hover:text-primary transition-colors">Ingredients</a></li>
              <li><a href="#nutrition" className="hover:text-primary transition-colors">Nutrition</a></li>
              <li><a href="#reviews" className="hover:text-primary transition-colors">Reviews</a></li>
              <li><a href="/admin-dashboard" className="hover:text-primary transition-colors text-foreground/20">Admin Hub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.3em] mb-6">Contact</h4>
            <ul className="space-y-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
              <li>hello@nectarjuice.com</li>
              <li>+1 (800) 555-NECTAR</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-foreground/20 lowercase tracking-[0.4em] font-bold">
          <p>© 2025 NECTAR Fresh Juice. All rights reserved.</p>
          <div className="flex gap-4">
             <a href="#" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}