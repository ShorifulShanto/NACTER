"use client";

import { useEffect, useState, useRef } from "react";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fallback timer to ensure the site reveals even if the video fails to load or end properly
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 1000);
    }, 6000); // 6 seconds maximum reveal

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleVideoEnded = () => {
    setFadeOut(true);
    setTimeout(onComplete, 1000);
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#000000] flex items-center justify-center transition-opacity duration-1000 gpu-smooth ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className="w-full h-full object-cover opacity-70"
      >
        <source 
          src="https://res.cloudinary.com/drmpjeatm/video/upload/q_auto/f_auto/v1778859538/motion2Fast_Cinematic_wide_shot_of_a_powerful_bioluminescent_w_01-ezgif.com-resize-video_rl78xu.mp4" 
          type="video/mp4" 
        />
      </video>
      
      {/* Minimal Brand Layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="animate-pulse">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-[0.5em] text-white opacity-30 select-none">
            NECTAR
          </h1>
        </div>
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/10 mt-6 font-bold">
          Fresh Cold-Pressed Batch
        </p>
      </div>
    </div>
  );
}
