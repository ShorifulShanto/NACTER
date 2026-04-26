"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { flavors } from "@/lib/flavor-data";
import { ChevronUp, ChevronDown, Instagram, Twitter, Facebook, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { AuthModal } from "./AuthModal";

export function NectarHero() {
  const [currentFlavorIndex, setCurrentFlavorIndex] = useState(0);
  const [isLoadingFlavor, setIsLoadingFlavor] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const heroImageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { user } = useUser();
  const db = useFirestore();
  const currentFlavor = flavors[currentFlavorIndex];

  const changeFlavor = useCallback((dir: "next" | "prev") => {
    if (isLoadingFlavor) return;
    setIsLoadingFlavor(true);
    
    setTimeout(() => {
      setCurrentFlavorIndex((prev) => {
        if (dir === "next") return (prev + 1) % flavors.length;
        return (prev - 1 + flavors.length) % flavors.length;
      });
      setIsLoadingFlavor(false);
    }, 800);
  }, [isLoadingFlavor]);

  useEffect(() => {
    if (isPaused) return;

    const autoRotateTimer = setTimeout(() => {
      changeFlavor("next");
    }, 10000); 

    return () => clearTimeout(autoRotateTimer);
  }, [currentFlavorIndex, changeFlavor, isPaused]);

  // Preload neighboring animations
  useEffect(() => {
    const nextIdx = (currentFlavorIndex + 1) % flavors.length;
    const prevIdx = (currentFlavorIndex - 1 + flavors.length) % flavors.length;
    
    if (typeof window !== 'undefined') {
      [nextIdx, prevIdx].forEach(idx => {
        const img = new (window as any).Image();
        img.src = flavors[idx].videoUrl;
      });
    }
  }, [currentFlavorIndex]);

  const productRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "products", currentFlavor.id);
  }, [db, currentFlavor.id]);

  const { data: productData } = useDoc(productRef);

  const price = productData?.price ?? 12.00;
  const isSoldOut = productData?.amount === 0;

  const scrollToProducts = () => {
    const section = document.getElementById('product');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="group relative h-[100svh] w-full overflow-hidden bg-black flex items-center gpu-smooth"
    >
      {/* Background Animated WebP */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div 
          ref={heroImageRef}
          className={`relative w-full h-full transition-all duration-1000 ease-in-out will-change-transform gpu-smooth ${isLoadingFlavor ? 'opacity-0 scale-105 blur-xl' : 'opacity-100 scale-100'}`}
        >
          <Image 
            key={currentFlavor.id}
            src={currentFlavor.videoUrl} 
            alt={`${currentFlavor.name} sequence`} 
            fill 
            className="object-contain p-8 md:p-20"
            unoptimized 
            priority 
          />
        </div>
      </div>

      <div className="absolute inset-0 hero-vignette z-10 pointer-events-none" />

      {/* Main Content Overlay */}
      <div className="relative z-20 h-full w-full flex items-center justify-between px-6 md:px-24">
        <div 
          ref={contentRef}
          className={`max-w-md transition-all duration-700 gpu-smooth ${isLoadingFlavor ? 'opacity-0 translate-y-8 blur-lg' : 'opacity-100 translate-y-0'}`}
        >
          <div className="space-y-6">
            <p className="text-white/40 font-bold tracking-[0.5em] text-[9px] uppercase hover:text-white transition-colors">
              NECTAR — real pressed
            </p>
            <h1 
              className="text-4xl md:text-5xl font-headline font-bold leading-[0.85] tracking-tighter uppercase transition-all duration-1000"
              style={{ color: currentFlavor.accentHex } as any}
            >
              {currentFlavor.name}
            </h1>
            <p className="text-[11px] md:text-[12px] font-accent tracking-[0.2em] italic transition-colors duration-1000" style={{ color: `${currentFlavor.accentHex}80` }}>
              {currentFlavor.subtitle}
            </p>
            <p className="text-[10px] md:text-[11px] text-white/40 leading-relaxed max-w-[300px] font-light hover:text-white transition-colors">
              {productData?.description || currentFlavor.description}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 bg-transparent border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/30 hover:border-primary/40 transition-colors">Cold Pressed</span>
              <span className="px-3 py-1 bg-transparent border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/30 hover:border-primary/40 transition-colors">High Vit C</span>
              <span className="px-3 py-1 bg-transparent border border-white/10 rounded-full text-[8px] uppercase tracking-widest text-white/30 hover:border-primary/40 transition-colors">No Added Sugar</span>
            </div>

            <div className="flex gap-4 pt-8">
              <button 
                onClick={scrollToProducts}
                style={{ 
                  backgroundColor: isSoldOut ? '#333' : currentFlavor.accentHex,
                  color: '#000'
                } as any}
                className={`px-10 py-4 font-bold rounded-full uppercase tracking-widest text-[10px] transition-all active:scale-95 hover:scale-105 shadow-xl`}
              >
                {isSoldOut ? "SOLD OUT" : "ORDER NOW →"}
              </button>
              <button 
                className="px-10 py-4 border border-white/10 bg-transparent text-white font-bold rounded-full uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all backdrop-blur-sm"
              >
                ${price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation and Flavor Counter */}
        <div className="flex flex-col items-center gap-12">
          <div className="text-center relative">
             <span 
               className="font-headline font-bold text-7xl md:text-8xl leading-none select-none transition-all duration-1000 inline-block border-style-number"
               style={{ 
                 WebkitTextStroke: `1px ${currentFlavor.accentHex}`,
                 '--flavor-color': currentFlavor.accentHex
               } as any}
             >
               {currentFlavor.index}
             </span>
             <p className="text-[9px] uppercase tracking-[0.5em] mt-2 font-bold transition-colors duration-1000" style={{ color: `${currentFlavor.accentHex}40` }}>
               {currentFlavor.index} / 07
             </p>
          </div>
          
          <div className="flex flex-col items-center gap-5">
            <button 
              onClick={() => changeFlavor("prev")}
              className="group flex flex-col items-center gap-2 py-2 text-[10px] font-bold tracking-[0.4em] text-white/20 transition-all bg-transparent border-none outline-none"
            >
              <ChevronUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              <span className="group-hover:text-white transition-all">PREV</span>
            </button>
            <div className="w-px h-12 bg-white/10" />
            <button 
              onClick={() => changeFlavor("next")}
              className="group flex flex-col items-center gap-2 py-2 text-[10px] font-bold tracking-[0.4em] text-white/20 transition-all bg-transparent border-none outline-none"
            >
              <span className="group-hover:text-white transition-all">NEXT</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8">
        <div className="flex gap-4">
          <Instagram className="w-4 h-4 text-white/15 hover:text-primary transition-colors cursor-pointer" />
          <Twitter className="w-4 h-4 text-white/15 hover:text-primary transition-colors cursor-pointer" />
          <Facebook className="w-4 h-4 text-white/15 hover:text-primary transition-colors cursor-pointer" />
        </div>
        
        <div className="w-px h-4 bg-white/10" />
        
        <button 
          onClick={() => setIsPaused(!isPaused)}
          className="group flex items-center gap-2 text-[9px] font-bold tracking-[0.3em] text-white/20 hover:text-white transition-all bg-transparent px-4 py-2 rounded-full border border-white/10"
        >
          {isPaused ? (
            <><Play size={10} fill="currentColor" /> PLAY</>
          ) : (
            <><Pause size={10} fill="currentColor" /> PAUSE</>
          )}
        </button>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </section>
  );
}
