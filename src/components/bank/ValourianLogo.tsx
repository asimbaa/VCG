import React from 'react';

export function ValourianLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="valourianGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer elegant ring */}
      <circle cx="50" cy="50" r="45" stroke="url(#valourianGradient)" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" opacity="0.8" />
      <circle cx="50" cy="50" r="45" stroke="url(#valourianGradient)" strokeWidth="1" strokeDasharray="4 8" />
      
      {/* Precision V shape */}
      <path d="M 30 35 L 50 70 L 70 35" stroke="url(#valourianGradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 40 35 L 50 55 L 60 35" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Top Diamond Dot */}
      <rect x="46" y="18" width="8" height="8" rx="1" fill="url(#valourianGradient)" transform="rotate(45 50 22)" />
    </svg>
  );
}
