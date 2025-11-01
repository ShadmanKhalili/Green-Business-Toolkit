import React from 'react';

// Updated WelcomeLeafIcon to match Header's LeafIcon
const WelcomeLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w.w3.org/2000/svg" 
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

// Icons for the new "How it works" steps
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


interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-2xl bg-bg-offset p-8 sm:p-12 rounded-xl shadow-soft-lg text-center animate-slideInUp no-print">
      <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
        <WelcomeLeafIcon className="w-20 h-20 sm:w-24 sm:h-24 text-p-green mx-auto mb-6" />
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
          সবুজ ব্যবসা মূল্যায়ন টুলকিটে স্বাগতম!
        </h2>
        <p className="text-md sm:text-lg text-text-secondary mb-8">
          আপনার ব্যবসার পরিবেশগত মান মূল্যায়ন করুন এবং উন্নতির জন্য ব্যক্তিগতকৃত পরামর্শ পান!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-10">
        {/* Step 1 */}
        <div className="flex flex-col items-center p-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-p-green-light mb-4">
            <ChecklistIcon className="w-8 h-8 text-p-green-dark" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">১. উত্তর দিন</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            পরিবেশগত অনুশীলন সম্পর্কে কয়েকটি সহজ প্রশ্নের উত্তর দিন।
          </p>
        </div>
        {/* Step 2 */}
        <div className="flex flex-col items-center p-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-s-teal-light mb-4">
            <ChartPieIcon className="w-8 h-8 text-s-teal-dark" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">২. স্কোর দেখুন</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            আপনার ব্যবসার জন্য একটি সবুজ স্কোর এবং বিভাগভিত্তিক বিশ্লেষণ পান।
          </p>
        </div>
        {/* Step 3 */}
        <div className="flex flex-col items-center p-4 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent-gold-light mb-4">
            <SparklesIcon className="w-8 h-8 text-accent-gold" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">৩. পরামর্শ নিন</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            উন্নতির জন্য জেমিনি এআই থেকে বাস্তবসম্মত পরামর্শ গ্রহণ করুন।
          </p>
        </div>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '900ms' }}>
        <button
          onClick={onStart}
          className="w-full sm:w-auto mx-auto bg-p-green hover:bg-p-green-dark text-white font-semibold py-3 px-10 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-p-green-dark focus:ring-opacity-60 animate-subtle-beat"
        >
          শুরু করুন
        </button>
      </div>
    </div>
  );
};
