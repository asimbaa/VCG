import React from "react";

export function Logo3D({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className || ""}`}>
      <div className="w-full h-full bg-slate-900 rounded-lg flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-white/0 to-white/0" />
        <div className="relative z-10 w-1/2 h-1/2 bg-[#ffcc00] rounded-[2px] transform rotate-45" />
      </div>
    </div>
  );
}
