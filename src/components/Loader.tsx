"use client";

import { useEffect, useState, useRef } from "react";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [isFinishing, setIsFinishing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // 4-second cinematic timing for the video playback
    const timer = setTimeout(() => {
      handleTransition();
    }, 4000); 

    return () => clearTimeout(timer);
  }, []);

  const handleTransition = () => {
    setIsFinishing(true);
    // Signal the parent to start revealing the site immediately as the loader scales out
    onComplete();
  };

  if (!isMounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-[opacity,transform,filter] duration-[1500ms] ease-in-out gpu-smooth ${
        isFinishing 
          ? 'opacity-0 scale-[1.2] blur-[20px] pointer-events-none' 
          : 'opacity-100 scale-100 blur-0'
      }`}
      style={{
        // Snappy Out-Quart easing for a fast, punchy exit
        transitionTimingFunction: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        willChange: 'opacity, transform, filter'
      }}
    >
      {/* Bioluminescent Morph Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        poster="https://res.cloudinary.com/drmpjeatm/video/upload/v1778859538/motion2Fast_Cinematic_wide_shot_of_a_powerful_bioluminescent_w_01-ezgif.com-resize-video_rl78xu.jpg"
      >
        <source 
          src="https://res.cloudinary.com/drmpjeatm/video/upload/q_auto/f_auto/v1778859538/motion2Fast_Cinematic_wide_shot_of_a_powerful_bioluminescent_w_01-ezgif.com-resize-video_rl78xu.mp4" 
          type="video/mp4" 
        />
      </video>
      
      {/* Minimalist Centered Brand Overlay */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-7xl font-headline font-black tracking-[0.5em] text-white opacity-80 animate-pulse select-none">
          NECTAR
        </h1>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40 pointer-events-none" />
    </div>
  );
}
