
"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-32 pb-32">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-primary transition-all mb-12 group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </Link>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <CheckCircle className="text-primary" size={48} />
          </div>
          
          <p className="text-primary text-[10px] uppercase tracking-[0.5em] mb-4 font-bold">Harvest Confirmed</p>
          <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tighter mb-6">
            Thank You<br />For Your Order
          </h1>
          <p className="text-white/40 max-w-md mx-auto mb-12 text-sm font-light leading-relaxed">
            Your NECTAR selection is being carefully packed at our grove. We'll notify you as soon as your fresh bottles are on their way.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="bg-white text-black hover:bg-neutral-200 rounded-full h-14 px-10 uppercase tracking-widest text-[10px] font-bold shadow-2xl">
              <Link href="/orders">
                <Package size={16} className="mr-2" />
                View My Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-full h-14 px-10 uppercase tracking-widest text-[10px] font-bold">
              <Link href="/">
                Continue Shopping
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
