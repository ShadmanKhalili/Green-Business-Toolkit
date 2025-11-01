import React from 'react';
import { toBengaliNumber } from '../utils';

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string; 
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120, 
  strokeWidth = 12, 
  colorClass = 'text-s-teal', // Default color class from new palette
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = Math.max(0, Math.min(percentage, 100)); 
  const offset = circumference - (progressValue / 100) * circumference;

  const textSizeClass = 
    size >= 140 ? 'text-2xl' :
    size >= 100 ? 'text-xl' :
    size >= 70 ? 'text-lg' : 'text-md';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`অগ্রগতি: ${percentage}%`}
        role="img"
      >
        <circle
          className="text-border-color" // Track color from new palette
          strokeWidth={strokeWidth}
          stroke="currentColor" // Inherits from text-border-color
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor" // Inherits from colorClass
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className={`absolute ${textSizeClass} font-bold ${colorClass}`}>
        {toBengaliNumber(Math.round(percentage))}%
      </span>
    </div>
  );
};
