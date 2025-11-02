import React from 'react';

// Updated LeafIcon
const LeafIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-8 h-8"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 00-9-9c0-4.969 4.031-9 9-9s9 4.031 9 9-4.031 9-9 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.969 0-9 4.031-9 9 0 2.484 1.008 4.734 2.635 6.365A8.96 8.96 0 0112 3z" />
  </svg>
);

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-p-green via-s-teal to-s-teal-dark text-white p-5 sm:p-6 shadow-lg">
      <div className="container mx-auto flex items-center justify-center space-x-4">
        <div title="সবুজ ব্যবসার প্রতীক">
          <LeafIcon className="w-10 h-10 sm:w-12 sm:h-12 text-p-green-light drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            সবুজ ব্যবসা মূল্যায়ন
          </h1>
          <p className="text-xs sm:text-sm text-p-green-light opacity-90">
            বাংলাদেশের উপকূলীয় মাইক্রো-উদ্যোগের জন্য
          </p>
        </div>
      </div>
    </header>
  );
};