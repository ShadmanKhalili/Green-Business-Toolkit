import React from 'react';

/**
 * A visually appealing, abstract SVG cover art component for the welcome screen.
 * It features organic, animated shapes with soft gradients representing coastal nature
 * (waves, leaves, sun) to create an engaging and modern first impression.
 */
export const WelcomeCoverArt: React.FC = () => (
  <div 
    className="w-full h-48 sm:h-56 rounded-lg overflow-hidden relative mb-6 shadow-inner bg-s-teal-light/10"
    aria-label="Abstract art representing a green coastal business theme"
  >
    <svg 
      className="absolute top-0 left-0 w-full h-full" 
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 300 150"
      role="img"
    >
      <defs>
        <linearGradient id="tealWave" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#B2DFDB" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#00897B" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="greenLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C8E6C9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#4CAF50" stopOpacity="1" />
        </linearGradient>
        <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* Background blobs */}
      <circle cx="250" cy="30" r="50" fill="rgba(255, 179, 0, 0.2)" className="animate-float-3" />
      <ellipse cx="50" cy="120" rx="80" ry="40" fill="rgba(76, 175, 80, 0.15)" className="animate-float-2" />

      {/* Main shapes */}
      <path 
        d="M -10,150 Q 80,80 160,110 T 310,90 V 160 H -10 Z" 
        fill="url(#tealWave)"
        className="animate-float-1"
      />
      
      <path 
        d="M 180,20 C 120,0 100,80 150,110 C 200,140 280,100 250,50 C 220,0 240,40 180,20 Z"
        fill="url(#greenLeaf)"
        filter="url(#soft-blur)"
        transform="rotate(-15 200 75)"
        className="animate-float-2"
      />

      <circle cx="260" cy="40" r="15" fill="#FFB300" className="animate-float-3" />
    </svg>
  </div>
);