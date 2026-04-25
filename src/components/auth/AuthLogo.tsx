
"use client";

import React from "react";

export function AuthLogo() {
  const primaryColor = "#1DCD9F";
  const secondaryColor = "#7AE2CF";
  const taglineColor = "#FFFDD0";

  return (
    <div className="text-center mb-4 relative">
      <div 
        className="font-headline font-black text-[30px] leading-none tracking-[3px] bg-clip-text text-transparent hover:[text-shadow:0_0_20px_#7AE2CF] transition-all"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})` }}
      >
        NECTAR
      </div>
      <p 
        className="text-[11px] tracking-[1.8px] mt-1 font-medium opacity-60 uppercase"
        style={{ color: taglineColor }}
      >
        Fresh Fruit Juice
      </p>
    </div>
  );
}
