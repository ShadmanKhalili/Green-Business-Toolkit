import React, { useState } from 'react';
import { PreAssessmentData, EmployeeCountRange } from '../types'; // Import EmployeeCountRange
import { BUSINESS_TYPES, LOCATIONS, EMPLOYEE_COUNT_RANGES } from '../constants';

const BriefcaseIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073a2.25 2.25 0 01-2.25 2.25h-12a2.25 2.25 0 01-2.25-2.25v-4.073M15.75 10.5h-7.5M15.75 10.5V3.75a3 3 0 00-3-3h-1.5a3 3 0 00-3 3V10.5m6.75 4.5l1.536-.864a2.252 2.252 0 011.414 0l1.536.864M6.75 12.75H5.25m4.5-4.5H9.75M15 7.5h-4.5m4.5 0a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25-2.25h-4.5a2.25 2.25 0 01-2.25-2.25v-1.5A2.25 2.25 0 0110.5 7.5h4.5z" />
  </svg>
);

const MapPinIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

// Updated BuildingIcon to BuildingOffice2Icon
const BuildingOffice2Icon: React.FC<{className?: string}> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375M9 12h6.375M9 17.25h6.375M4.5 6.75h.75v10.5h-.75V6.75zm15 0h.75v10.5h-.75V6.75z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.625c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 8.625V7.5A1.125 1.125 0 014.125 6.375h15.75A1.125 1.125 0 0121 7.5v1.125z" />
</svg>
);

const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.582M12 15.75a3 3 0 01-3-3m3 3a3 3 0 00-3-3m3 3V18m-3-4.5H6.75m0 0A3.75 3.75 0 013 15V9c0-1.09.268-2.094.741-2.992M6.75 11.25A3.75 3.75 0 003 7.5V3c0 1.09.268 2.094.741 2.992" />
  </svg>
);

const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-6.75-4.5v10.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v2.25Z" />
    </svg>
);

const InformationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);

const ChevronUpDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>
);


interface PreAssessmentFormProps {
  onSubmit: (data: PreAssessmentData) => void;
}

export const PreAssessmentForm: React.FC<PreAssessmentFormProps> = ({ onSubmit }) => {
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(BUSINESS_TYPES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [mainChallengeOrGoal, setMainChallengeOrGoal] = useState('');
  const [employeeCount, setEmployeeCount] = useState<EmployeeCountRange>(EMPLOYEE_COUNT_RANGES[0]);
  const [businessDescription, setBusinessDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setFormError('ব্যবসার নাম আবশ্যক।');
      return;
    }
    setFormError(null);
    onSubmit({ 
      businessName: businessName.trim(), 
      businessType, 
      location,
      mainChallengeOrGoal: mainChallengeOrGoal.trim(),
      employeeCount,
      businessDescription: businessDescription.trim()
    });
  };

  const inputBaseClasses = "mt-1 block w-full px-3 py-2.5 bg-bg-offset border border-border-color rounded-md shadow-sm focus:outline-none focus:border-s-teal-dark focus:ring-1 focus:ring-s-teal-dark sm:text-sm text-text-primary";
  const iconBaseClasses = "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted transition-all duration-200 ease-in-out group-focus-within:text-s-teal-dark group-focus-within:scale-110";
  const textareaBaseClasses = `${inputBaseClasses} min-h-[80px] resize-y`;


  return (
    <div className="w-full max-w-md bg-bg-offset p-6 sm:p-8 rounded-xl shadow-soft-lg animate-slideInUp">
      <div className="flex flex-col items-center mb-6 sm:mb-8">
        <BuildingOffice2Icon className="w-12 h-12 text-s-teal mb-3" />
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-1">ব্যবসার তথ্য দিন</h2>
        <p className="text-sm sm:text-md text-text-secondary text-center">মূল্যায়ন শুরু করার আগে আপনার ব্যবসা সম্পর্কে কিছু তথ্য দিন।</p>
      </div>

      {formError && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2.5 rounded-md relative mb-5 text-sm flex items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-text-primary mb-1">
            আপনার ব্যবসার নাম <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className={iconBaseClasses}>
              <BriefcaseIcon />
            </div>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className={`${inputBaseClasses} pl-10`}
              required
              aria-describedby="businessNameError"
            />
          </div>
           {formError && !businessName.trim() && <p id="businessNameError" className="text-xs text-red-600 mt-1">{formError}</p>}
        </div>

        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-text-primary mb-1">
            ব্যবসার ধরণ
          </label>
           <div className="relative group">
             <div className={iconBaseClasses}>
                <TagIcon className="w-5 h-5"/>
             </div>
            <select
              id="businessType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={`${inputBaseClasses} pl-10 appearance-none`}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-text-primary mb-1">
            আপনার ব্যবসার অবস্থান
          </label>
          <div className="relative group">
            <div className={iconBaseClasses}>
                <MapPinIcon/>
            </div>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${inputBaseClasses} pl-10 appearance-none`}
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="employeeCount" className="block text-sm font-medium text-text-primary mb-1">
            আপনার ব্যবসার কর্মী সংখ্যা কত?
          </label>
          <div className="relative group">
            <div className={iconBaseClasses}>
                <UserGroupIcon/>
            </div>
            <select
              id="employeeCount"
              value={employeeCount}
              onChange={(e) => setEmployeeCount(e.target.value as EmployeeCountRange)}
              className={`${inputBaseClasses} pl-10 appearance-none`}
            >
              {EMPLOYEE_COUNT_RANGES.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronUpDownIcon className="h-5 w-5 text-text-muted" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="businessDescription" className="block text-sm font-medium text-text-primary mb-1">
            আপনার ব্যবসার সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)
          </label>
          <div className="relative group">
            <div className={`${iconBaseClasses} top-3 transform-none`}>
                 <InformationCircleIcon />
            </div>
            <textarea
              id="businessDescription"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className={`${textareaBaseClasses} pl-10`}
              rows={3}
              placeholder="যেমন: আমরা স্থানীয়ভাবে ধরা মাছ শুকিয়ে বিক্রি করি, অথবা আমরা হাতে তৈরি ঝুড়ি তৈরি করি।"
            />
          </div>
        </div>

        <div>
          <label htmlFor="mainChallengeOrGoal" className="block text-sm font-medium text-text-primary mb-1">
            আপনার ব্যবসার প্রধান পরিবেশগত চ্যালেঞ্জ অথবা আপনি কোন সবুজ উদ্যোগ নিতে সবচেয়ে বেশি আগ্রহী? (ঐচ্ছিক)
          </label>
          <div className="relative group">
            <div className={`${iconBaseClasses} top-3 transform-none`}>
                 <ChatBubbleIcon />
            </div>
            <textarea
              id="mainChallengeOrGoal"
              value={mainChallengeOrGoal}
              onChange={(e) => setMainChallengeOrGoal(e.target.value)}
              className={`${textareaBaseClasses} pl-10`}
              rows={3}
              placeholder="যেমন: বর্জ্য ব্যবস্থাপনা, শক্তি খরচ কমানো, প্লাস্টিক ব্যবহার কমানো ইত্যাদি।"
            />
          </div>
        </div>


        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-interactive hover:shadow-interactive-hover text-base font-medium text-white bg-p-green hover:bg-p-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-p-green-dark transition-all duration-150 ease-in-out transform hover:scale-102"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            মূল্যায়ন শুরু করুন
          </button>
        </div>
      </form>
    </div>
  );
};