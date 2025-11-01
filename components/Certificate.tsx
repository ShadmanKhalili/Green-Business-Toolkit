import React from 'react';
import { toBengaliNumber } from '../utils';

const CertificateLeafIcon: React.FC<{ className?: string }> = ({ className }) => (
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

interface CertificateProps {
  businessName: string;
  percentage: number;
  assessmentDate: Date;
}

export const Certificate: React.FC<CertificateProps> = ({ businessName, percentage, assessmentDate }) => {
  
  const formattedDate = new Intl.DateTimeFormat('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(assessmentDate);

  let scoreColorClass = 'text-red-500';
  if (percentage >= 75) scoreColorClass = 'text-p-green';
  else if (percentage >= 50) scoreColorClass = 'text-yellow-500';
  else if (percentage >= 25) scoreColorClass = 'text-orange-500';

  return (
    <div className="bg-white p-4 font-sans" style={{ width: '297mm', height: '210mm', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', color: '#212529' }}>
      <div className="w-full h-full flex items-center justify-center relative border-8 border-s-teal-dark p-2">
        <div className="w-full h-full flex flex-col text-center border-2 border-p-green p-6 relative">
          {/* Watermark */}
          <div title="সবুজ ব্যবসার প্রতীক" className="absolute inset-0 m-auto w-3/4 h-3/4 text-p-green-light opacity-10 z-0">
            <CertificateLeafIcon className="w-full h-full" />
          </div>
          
          {/* Header */}
          <header className="relative z-10 mb-4">
            <div className="flex items-center justify-center space-x-4">
              <div title="সবুজ ব্যবসার প্রতীক">
                <CertificateLeafIcon className="w-14 h-14 text-s-teal" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-s-teal-dark">
                  সবুজ ব্যবসা মূল্যায়ন
                </h1>
                <p className="text-sm text-s-teal-dark opacity-90">
                  বাংলাদেশের উপকূলীয় মাইক্রো-উদ্যোগের জন্য
                </p>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-grow flex flex-col justify-center items-center relative z-10 px-6">
            <h2 className="text-4xl font-bold my-5" style={{fontFamily: "'Times New Roman', serif"}}>সনদপত্র</h2>
            <p className="text-md mb-3">এই মর্মে প্রত্যয়ন করা যাচ্ছে যে</p>
            <p className="text-3xl font-bold text-p-green-dark mb-4 px-4 pb-2 border-b-2 border-p-green">
              {businessName}
            </p>
            <p className="text-md mb-6 max-w-xl leading-relaxed">
              উপকূলীয় সবুজ ব্যবসা মূল্যায়ন টুলকিট দ্বারা সফলভাবে তাদের পরিবেশগত কর্মক্ষমতা মূল্যায়ন করেছে।
            </p>
            
            <div className="bg-p-green-light/20 rounded-lg px-8 py-4">
              <p className="text-lg font-semibold text-gray-700">আপনার সবুজ ব্যবসা স্কোর</p>
              <p className={`text-7xl font-bold ${scoreColorClass}`}>
                {toBengaliNumber(percentage)}<span className="text-4xl text-gray-600">/১০০</span>
              </p>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-auto flex justify-between w-full items-end text-sm relative z-10">
            <div className="text-center">
              <p className="border-b-2 border-gray-400 pb-1 px-8">{formattedDate}</p>
              <p className="text-gray-600 mt-1.5 font-semibold">মূল্যায়নের তারিখ</p>
            </div>
            <div className="text-center">
              <p className="border-b-2 border-gray-400 pb-1 px-8" style={{color: 'transparent'}}>স্বাক্ষর</p>
              <p className="text-gray-600 mt-1.5 font-semibold">কর্তৃপক্ষের স্বাক্ষর</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};