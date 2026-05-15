"use client";

import { useEffect, useState, useRef } from "react";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [isFinishing, setIsFinishing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Strict 4-second cinematic timing before snappy reveal
    const timer = setTimeout(() => {
      handleTransition();
    }, 4000); 

    return () => clearTimeout(timer);
  }, []);

  const handleTransition = () => {
    setIsFinishing(true);
    // Signal the parent immediately so the content unblurs WHILE the loader scales out
    onComplete();
  };

  if (!isMounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-all duration-1500 ease-in-out gpu-smooth ${
        isFinishing 
          ? 'opacity-0 scale-[1.5] blur-[80px] pointer-events-none' 
          : 'opacity-100 scale-100 blur-0'
      }`}
      style={{
        // Professional Out-Expo easing for high-end cinematic feel
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Bioluminescent Morph Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      >
        <source 
          src="https://res.cloudinary.com/drmpjeatm/video/upload/q_auto/f_auto/v1778859538/motion2Fast_Cinematic_wide_shot_of_a_powerful_bioluminescent_w_01-ezgif.com-resize-video_rl78xu.mp4" 
          type="video/mp4" 
        />
      </video>
      
      {/* Minimalist Centered Brand Overlay - Resized for elegance */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-7xl font-headline font-black tracking-[0.5em] text-white opacity-80 animate-pulse select-none">
          NECTAR
        </h1>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40 pointer-events-none" />
    </div>
  );
}
