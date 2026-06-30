import React from 'react';

export function ValourianAULogo({ className = "w-8 h-8", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Outer Hexagon Shield */}
      <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Core V Architecture */}
      <path d="M25 35 L50 80 L75 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Inner Synchronization Point */}
      <path d="M35 25 L50 50 L65 25" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Background Gradient for Depth (Optional usage based on stroke vs fill) */}
      <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="currentColor" fillOpacity="0.05" />
    </svg>
  );
}
