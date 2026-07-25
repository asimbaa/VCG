import React from 'react';
import valourianLogoPath from '../../assets/images/valourian_logo_1783944728350.jpg';

export function ValourianLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <img 
      src={valourianLogoPath} 
      alt="Valourian Capital Logo" 
      className={`${className} object-cover rounded-xl shadow-sm`} 
    />
  );
}
