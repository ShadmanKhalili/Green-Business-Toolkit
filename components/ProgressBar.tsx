import React from 'react';

interface ProgressBarProps {
  progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const displayProgress = Math.round(progress);
  return (
    <div className="w-full mb-2 sm:mb-4"> {/* Reduced margin as navigator now shows current question */}
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-medium text-s-teal-dark">অগ্রগতি</span>
        <span className="text-xs font-medium text-s-teal-dark">{displayProgress}%</span>
      </div>
      <div className="w-full bg-border-color rounded-full h-3.5 shadow-inner overflow-hidden">
        <div
          className="bg-gradient-to-r from-p-green to-s-teal h-3.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${displayProgress}%` }}
          role="progressbar"
          aria-valuenow={displayProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="মূল্যায়নের অগ্রগতি"
        ></div>
      </div>
    </div>
  );
};