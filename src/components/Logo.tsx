import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
          <feOffset dx="0" dy="1" result="offset" />
          <feMerge>
            <feMergeNode in="offset" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Background with fluid shape */}
      <rect x="10" y="10" width="80" height="80" rx="24" fill="white" className="dark:fill-slate-800" fillOpacity="0.1" />
      <rect x="5" y="5" width="90" height="90" rx="28" stroke="url(#logo-gradient)" strokeWidth="0.5" strokeOpacity="0.3" />

      {/* Modern Fluid 'S' */}
      <path
        d="M30 35 C 30 20, 70 20, 70 42.5 C 70 65, 30 60, 30 82.5 C 30 105, 70 105, 70 90"
        stroke="url(#logo-gradient)"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
        transform="scale(0.85) translate(8, 8)"
        filter="url(#logo-glow)"
      />
      
      {/* Accent points */}
      <circle cx="75" cy="25" r="5" fill="#c084fc" />
      <circle cx="25" cy="75" r="5" fill="#4f46e5" />
    </svg>
  );
};
