
"use client";

import React from "react";

interface AuthSocialProps {
  onGoogle: () => void;
  isLoading: boolean;
}

export function AuthSocial({ onGoogle, isLoading }: AuthSocialProps) {
  return (
    <div className="w-full">
      <button 
        onClick={onGoogle}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 group hover:border-primary/20"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5"/>
        <span className="text-[11px] font-bold text-white uppercase tracking-widest group-hover:text-primary transition-colors">Continue with Google</span>
      </button>
    </div>
  );
}
