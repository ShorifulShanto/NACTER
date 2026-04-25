"use client";

import { useEffect, useState } from "react";

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const duration = 2000;

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const nextProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      
      setProgress(nextProgress);

      if (nextProgress < 100) {
        requestAnimationFrame(update);
      } else {
        setTimeout(onComplete, 400);
      }
    };

    const frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center transition-opacity duration-1000 gpu-smooth">
      <div className="mb-12 text-center flex flex-col items-center">
        <div className="animate-heartbeat">
          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-[0.3em] text-white">
            NECTAR
          </h1>
        </div>
        <p className="text-[10px] tracking-[0.4em] uppercase text-white/30 mt-4 font-bold">
          Fresh Cold-Pressed Juice
        </p>
      </div>
      <div className="w-64 h-0.5 bg-white/10 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_15px_#1DCD9F]" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="font-mono text-[9px] tracking-[0.3em] text-white/20 uppercase font-bold">
        Initializing {progress}%
      </p>
    </div>
  );
}
