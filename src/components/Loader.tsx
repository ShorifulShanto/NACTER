"use client";

import { useEffect, useState, useRef } from "react";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [isFinishing, setIsFinishing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Safety timeout to ensure the site reveals even if the video has issues
    const timer = setTimeout(() => {
      handleTransition();
    }, 7000); 

    return () => clearTimeout(timer);
  }, []);

  const handleTransition = () => {
    setIsFinishing(true);
    // The blur/fade duration is 1.2s in CSS, so we wait slightly less to start revealing content
    setTimeout(onComplete, 1000);
  };

  const handleVideoEnded = () => {
    handleTransition();
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-all duration-[1200ms] ease-in-out gpu-smooth ${
        isFinishing ? 'opacity-0 scale-110 blur-[40px] pointer-events-none' : 'opacity-100 scale-100 blur-0'
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnded}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source 
          src="https://res.cloudinary.com/drmpjeatm/video/upload/q_auto/f_auto/v1778859538/motion2Fast_Cinematic_wide_shot_of_a_powerful_bioluminescent_w_01-ezgif.com-resize-video_rl78xu.mp4" 
          type="video/mp4" 
        />
      </video>
      
      {/* Minimalist Centered Brand */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-5xl md:text-8xl font-headline font-black tracking-[0.4em] text-white opacity-80 animate-pulse select-none">
          NECTAR
        </h1>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-40 pointer-events-none" />
    </div>
  );
}
