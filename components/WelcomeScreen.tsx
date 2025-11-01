import React from 'react';
import { WelcomeCoverArt } from './WelcomeCoverArt';

// Icons for the "How it works" steps
const ChecklistIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ChartPieIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
  </svg>
);
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" />
  </svg>
);
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  </svg>
);


interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-3xl bg-bg-offset/80 backdrop-blur-sm p-8 sm:p-12 rounded-2xl shadow-soft-lg text-center animate-fade-in overflow-hidden no-print">
      
      {/* Hero Section */}
      <div className="animated-component animate-slide-fade-in">
        <WelcomeCoverArt />
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3 mt-8 animated-component animate-slide-fade-in animation-delay-100">
          সবুজ ব্যবসা মূল্যায়ন টুলকিটে স্বাগতম!
        </h2>
        <p className="text-md sm:text-lg text-text-secondary mb-10 max-w-xl mx-auto animated-component animate-slide-fade-in animation-delay-200">
          আপনার ব্যবসার পরিবেশগত মান মূল্যায়ন করুন এবং উন্নতির জন্য ব্যক্তিগতকৃত পরামর্শ পান!
        </p>
      </div>

      {/* "How it works" Section */}
      <div className="mb-12">
        <h3 className="text-xl font-semibold text-text-primary mb-8 animated-component animate-slide-fade-in animation-delay-300">কিভাবে এটি কাজ করে?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Step 1 Card */}
          <div className="flex flex-col items-center p-6 bg-bg-main rounded-xl shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5 animated-component animate-slide-fade-in animation-delay-400">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-p-green-light mb-4" title="প্রশ্নের উত্তর দিন">
              <ChecklistIcon className="w-8 h-8 text-p-green-dark" />
            </div>
            <h4 className="font-semibold text-text-primary mb-1 text-lg">১. উত্তর দিন</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              পরিবেশগত অনুশীলন সম্পর্কে কয়েকটি সহজ প্রশ্নের উত্তর দিন।
            </p>
          </div>
          {/* Step 2 Card */}
          <div className="flex flex-col items-center p-6 bg-bg-main rounded-xl shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5 animated-component animate-slide-fade-in animation-delay-500">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-s-teal-light mb-4" title="স্কোর এবং বিশ্লেষণ দেখুন">
              <ChartPieIcon className="w-8 h-8 text-s-teal-dark" />
            </div>
            <h4 className="font-semibold text-text-primary mb-1 text-lg">২. স্কোর দেখুন</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              আপনার ব্যবসার জন্য একটি সবুজ স্কোর এবং বিভাগভিত্তিক বিশ্লেষণ পান।
            </p>
          </div>
          {/* Step 3 Card */}
          <div className="flex flex-col items-center p-6 bg-bg-main rounded-xl shadow-soft transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1.5 animated-component animate-slide-fade-in animation-delay-600">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent-gold-light mb-4" title="ব্যক্তিগতকৃত পরামর্শ নিন">
              <SparklesIcon className="w-8 h-8 text-accent-gold" />
            </div>
            <h4 className="font-semibold text-text-primary mb-1 text-lg">৩. পরামর্শ নিন</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              উন্নতির জন্য জেমিনি এআই থেকে বাস্তবসম্মত পরামর্শ গ্রহণ করুন।
            </p>
          </div>
        </div>
      </div>
      
      {/* Start Button */}
      <div className="animated-component animate-slide-fade-in animation-delay-700">
        <button
          onClick={onStart}
          className="w-full sm:w-auto mx-auto bg-p-green hover:bg-p-green-dark text-white font-semibold py-4 px-12 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-p-green-dark focus:ring-opacity-60 animate-subtle-beat flex items-center justify-center group"
        >
          মূল্যায়ন শুরু করুন
          <ArrowRightIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};