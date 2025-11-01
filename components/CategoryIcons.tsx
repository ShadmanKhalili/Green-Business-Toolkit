import React from 'react';

const defaultIconClass = "w-7 h-7"; // Default class for category icons in ResultsDisplay

// Resource Efficiency Icon (e.g., energy bolt)
export const ResourceEfficiencyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

// Waste and Pollution Icon (trash can)
export const WastePollutionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.342.052.682.107 1.022.166m0 0L12 12m0 0l-1.022-.165M12 12l-3.22 3.22m3.22-3.22l3.22 3.22m0-3.22l-1.022.165M7.5 5.25h9" />
  </svg>
);

// Social Responsibility Icon (e.g., users/community)
export const SocialResponsibilityIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.582M12 15.75a3 3 0 01-3-3m3 3a3 3 0 00-3-3m3 3V18m-3-4.5H6.75m0 0A3.75 3.75 0 013 15V9c0-1.09.268-2.094.741-2.992M6.75 11.25A3.75 3.75 0 003 7.5V3c0 1.09.268 2.094.741 2.992" />
  </svg>
);

// Climate Change Icon (e.g., globe)
export const ClimateChangeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.356 0 2.673-.11 3.935-.322M12 21c-1.356 0-2.673-.11-3.935-.322m0 0A9.007 9.007 0 012.25 12c0-1.356.11-2.673.322-3.935m15.836 0c.212 1.262.322 2.579.322 3.935 0 1.356-.11 2.673-.322 3.935m0 0c.212-1.262.322-2.579.322-3.935a9.007 9.007 0 00-2.25-6.364M3.75 12c0-1.356.11-2.673.322-3.935m0 0A9.007 9.007 0 016.364 3.75" />
  </svg>
);

// Business Management Icon (cog wheel)
export const BusinessManagementIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m15 0h1.5m-1.5-1.5l-1.5-1.5m1.5 1.5l1.5 1.5m-15-3l1.5-1.5m-1.5 1.5l-1.5 1.5" />
  </svg>
);

// Sparkles Icon (used for Recommendations title and default category icon)
export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || defaultIconClass}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" />
  </svg>
);