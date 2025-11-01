
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-s-teal-dark border-opacity-80"></div>
    </div>
  );
};