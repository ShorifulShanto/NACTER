"use client";

import React from "react";

export function AuthFloatingLabels() {
  const labelStyle = "fixed z-10 hidden lg:block font-bold text-[13px] text-white/75 drop-shadow-lg animate-float";

  return (
    <>
      <div className={`${labelStyle} top-[9%] left-[2%]`} style={{ animationDelay: '0.3s' }}>
        Fresh Login<span className="block text-[16px]">↙</span>
      </div>
      <div className={`${labelStyle} top-[52%] left-[0%]`} style={{ animationDelay: '1.2s' }}>
        Juicy Deals<span className="block text-[16px]">↓</span>
      </div>
      <div className={`${labelStyle} top-[85%] left-[2%]`} style={{ animationDelay: '2.1s' }}>
        Smooth Experience<span className="block text-[16px]">↗</span>
      </div>
      <div className={`${labelStyle} top-[3%] right-[12%]`} style={{ animationDelay: '0.7s' }}>
        Quick Access<span className="block text-[16px]">↙</span>
      </div>
      <div className={`${labelStyle} top-[40%] right-[0%]`} style={{ animationDelay: '1.8s' }}>
        Healthy Choice<span className="block text-[16px]">↙</span>
      </div>
    </>
  );
}
