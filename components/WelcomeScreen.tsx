import React from 'react';

// Updated WelcomeLeafIcon to match Header's LeafIcon
const WelcomeLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-16 h-16"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 00-9-9c0-4.969 4.031-9 9-9s9 4.031 9 9-4.031 9-9 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.969 0-9 4.031-9 9 0 2.484 1.008 4.734 2.635 6.365A8.96 8.96 0 0112 3z" />
  </svg>
);

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-xl bg-bg-offset p-8 sm:p-12 rounded-xl shadow-soft-lg text-center animate-slideInUp no-print">
      <WelcomeLeafIcon className="w-20 h-20 sm:w-24 sm:h-24 text-p-green mx-auto mb-6" />
      
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
        সবুজ ব্যবসা মূল্যায়ন টুলকিটে স্বাগতম!
      </h2>
      
      <p className="text-md sm:text-lg text-text-secondary mb-3">
        আপনার ব্যবসার পরিবেশগত মান মূল্যায়ন করুন এবং উন্নতির জন্য ব্যক্তিগতকৃত পরামর্শ পান!
      </p>
      
      <p className="text-sm text-text-secondary mb-8 leading-relaxed">
        এই টুলকিটটি বাংলাদেশের উপকূলীয় কুটির ও মাইক্রো উদ্যোগগুলির জন্য বিশেষভাবে তৈরি করা হয়েছে। কয়েকটি সহজ প্রশ্নের উত্তর দিন, আপনার স্কোর জানুন, এবং জেমিনি এআই থেকে বিশেষজ্ঞ পরামর্শ গ্রহণ করুন।
      </p>
      
      <button
        onClick={onStart}
        className="w-full sm:w-auto mx-auto bg-p-green hover:bg-p-green-dark text-white font-semibold py-3 px-10 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-p-green-dark focus:ring-opacity-60"
      >
        শুরু করুন
      </button>
    </div>
  );
};