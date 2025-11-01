
import React from 'react';
import type { QuestionNavigatorProps } from '../types';

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({ 
  totalQuestions, 
  currentQuestionIndex, 
  onJump,
  isDisabled 
}) => {
  const questionNumbers = Array.from({ length: totalQuestions }, (_, i) => i);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIndex = parseInt(event.target.value, 10);
    onJump(selectedIndex);
  };

  return (
    <div className="mb-6">
      <label htmlFor="question-jumper" className="block text-sm font-medium text-text-primary mb-1.5">
        প্রশ্নে যান:
      </label>
      <div className="relative">
        <select
          id="question-jumper"
          value={currentQuestionIndex}
          onChange={handleChange}
          disabled={isDisabled}
          className={`block w-full appearance-none rounded-md border border-border-color bg-bg-offset py-2.5 pl-3 pr-10 text-base 
                      text-text-primary focus:border-s-teal focus:outline-none focus:ring-1 focus:ring-s-teal 
                      sm:text-sm shadow-sm transition-colors
                      disabled:opacity-70 disabled:bg-disabled-bg`}
          aria-label="প্রশ্ন নির্বাচন করুন"
        >
          {questionNumbers.map((num) => (
            <option key={num} value={num}>
              প্রশ্ন {num + 1}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-center text-sm text-text-secondary mt-3 -mb-2">
        বর্তমান প্রশ্ন: {currentQuestionIndex + 1} / {totalQuestions}
      </p>
    </div>
  );
};