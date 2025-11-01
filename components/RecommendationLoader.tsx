import React, { useState, useEffect } from 'react';
import { RECOMMENDATION_TIPS } from '../constants';

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311V21m-3.75-2.311v-.658a4.5 4.5 0 011.658-3.256 4.5 4.5 0 015.682 0A4.5 4.5 0 0118 15.658v.658m-6.091-9.311A2.25 2.25 0 0112 4.5a2.25 2.25 0 012.091 1.84m-4.182 0a2.25 2.25 0 00-2.091 1.84" />
  </svg>
);

export const RecommendationLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState(RECOMMENDATION_TIPS[0]);

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { // Stop just before 100 to let the API call finish it
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 800); // Adjust timing for a realistic feel

    // Cycle through facts
    const factInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * RECOMMENDATION_TIPS.length);
      setCurrentFact(RECOMMENDATION_TIPS[randomIndex]);
    }, 3500); // Change fact every 3.5 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(factInterval);
    };
  }, []);

  return (
    <div className="text-center p-6 bg-s-teal-light/20 rounded-lg shadow-inner">
      <h4 className="text-lg font-semibold text-s-teal-dark mb-4 animate-pulse">
        জেমিনি এআই দিয়ে উপযুক্ত পরামর্শ তৈরি করা হচ্ছে...
      </h4>
      <div className="w-full bg-border-color rounded-full h-4 shadow-inner overflow-hidden mb-4">
        <div
          className="bg-gradient-to-r from-p-green to-s-teal h-4 rounded-full transition-all duration-500 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="mt-6 p-4 bg-white/60 rounded-lg border border-p-green-light min-h-[100px] flex items-center justify-center">
        <div className="flex items-start space-x-3">
          <div title="আপনি কি জানেন?">
            <LightbulbIcon className="w-8 h-8 text-accent-gold flex-shrink-0 mt-1" />
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm mb-1">আপনি কি জানেন?</p>
            <p className="text-sm text-text-secondary text-left">{currentFact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};