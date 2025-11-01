import React from 'react';
import type { Question, ScoreOption, QuestionCardProps } from '../types';

const PreviousIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
  </svg>
);

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, currentValue, onGoBack, isFirstQuestion }) => {
  const handleSelection = (score: number) => {
    onAnswer(question.id, score);
  };

  return (
    <div className="space-y-6 sm:space-y-8 mt-6">
      <div className="p-4 bg-s-teal-light/30 rounded-lg shadow-soft">
         <span className="bg-s-teal text-white px-3 py-1 rounded-full text-xs font-semibold inline-block mb-2 shadow-sm">
           {question.category}
         </span>
         <h2 className="text-lg sm:text-xl font-semibold text-text-primary leading-tight">{question.text}</h2>
      </div>
     
      <div className="space-y-3">
        <p className="text-sm text-text-secondary mb-3">অনুগ্রহ করে সেই বিকল্পটি নির্বাচন করুন যা আপনার ব্যবসার অনুশীলনগুলিকে সবচেয়ে ভালোভাবে বর্ণনা করে:</p>
        {question.options.map((option: ScoreOption) => (
          <button
            key={option.value}
            onClick={() => handleSelection(option.value)}
            className={`w-full text-left p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ease-in-out transform 
                        focus:outline-none focus:ring-2 focus:ring-offset-1 leading-normal
                        ${currentValue === option.value 
                          ? 'bg-s-teal-light border-s-teal-dark ring-2 ring-s-teal-dark text-s-teal-dark shadow-interactive-hover scale-102' 
                          : 'bg-bg-offset border-border-color text-text-primary hover:bg-s-teal-light/40 hover:border-s-teal shadow-interactive hover:shadow-interactive-hover hover:scale-[1.01]'}`}
            aria-pressed={currentValue === option.value}
          >
            <span className="font-medium text-sm sm:text-base">{option.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-8">
        <button
          onClick={onGoBack}
          disabled={isFirstQuestion}
          className={`w-full flex items-center justify-center px-6 py-3 border border-s-teal text-s-teal-dark font-medium rounded-lg
                      hover:bg-s-teal-light/40 hover:shadow-interactive-hover
                      focus:outline-none focus:ring-2 focus:ring-s-teal focus:ring-opacity-50
                      transition-all duration-150 ease-in-out transform hover:scale-102
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:scale-100`}
        >
          <PreviousIcon className="w-5 h-5 mr-2" />
          পূর্ববর্তী
        </button>
      </div>
    </div>
  );
};