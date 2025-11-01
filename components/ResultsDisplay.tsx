import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoadingSpinner } from './LoadingSpinner';
import { QuestionCategory } from '../types';
import type { Answer, PreAssessmentData } from '../types'; 
import { MAX_SCORE_PER_QUESTION, QUESTION_WEIGHTS_BY_BUSINESS_TYPE } from '../constants'; 
import { CircularProgress } from './CircularProgress';
import { Certificate } from './Certificate';
import { 
  ResourceEfficiencyIcon, 
  WastePollutionIcon, 
  SocialResponsibilityIcon,
  ClimateChangeIcon,
  BusinessManagementIcon,
  SparklesIcon,
} from './CategoryIcons';

// Custom hook for animating number count-up effect
const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  const frameRate = 1000 / 60; // 60fps
  const totalFrames = Math.round(duration / frameRate);
  
  useEffect(() => {
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(end * progress);
      setCount(currentCount);
      
      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(end); // Ensure it ends on the exact number
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [end, duration, totalFrames, frameRate]);

  return count;
};


interface ResultsDisplayProps {
  score: number; // This will be the weighted total score
  maxPossibleScore: number; // This will be the weighted max possible score
  recommendations: string;
  isLoadingRecommendations: boolean;
  onRestart: () => void;
  answers: Answer[];
  preAssessmentData: PreAssessmentData | null; 
}

// Skeleton Loader for Recommendations
const RecommendationSkeleton: React.FC = () => (
  <div className="space-y-5 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
     <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);


// Icons for UI elements
const ScoreTrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0012.75 9.75H11.25A3.375 3.375 0 007.5 13.125V18.75m9 0h1.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v9.75A2.25 2.25 0 004.5 18.75H6M12 9V6.75m0 2.25A1.125 1.125 0 0110.875 9H9.375A1.125 1.125 0 018.25 7.875V5.625M15.75 9V6.75m0 2.25A1.125 1.125 0 0014.625 9h-1.5a1.125 1.125 0 00-1.125 1.125V7.875" />
  </svg>
);

const RecommendationsIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z" />
  </svg>
);

const RestartIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
);

const ArrowDownTrayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.976 5.197M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WrenchScrewdriverIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.471-2.471a1.125 1.125 0 00-1.59-1.59L9.828 12.5a1.125 1.125 0 00-1.59 1.59l2.471 2.471z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.082 5.109L15.33 3.86a2.652 2.652 0 013.75 3.75L17.89 8.81m-1.742-1.742l-2.47-2.47a1.125 1.125 0 00-1.59 1.59l2.47 2.47m-1.742-1.742a1.125 1.125 0 00-1.59 1.59" />
  </svg>
);

const ListItemMarkerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className || "w-2.5 h-2.5"} aria-hidden="true">
    <path d="M8 .25a.75.75 0 0 1 .67.418l3.5 7a.75.75 0 0 1-1.34.664L8 2.73 4.17 8.332a.75.75 0 0 1-1.34-.664l3.5-7A.75.75 0 0 1 8 .25Z" />
  </svg>
);

const getCategoryIcon = (categoryName: QuestionCategory): React.ReactNode => {
  const iconProps = { className: "w-6 h-6 mr-3 text-s-teal-dark flex-shrink-0" };
  switch (categoryName) {
    case QuestionCategory.RESOURCE_EFFICIENCY:
      return <ResourceEfficiencyIcon {...iconProps} />;
    case QuestionCategory.WASTE_POLLUTION:
      return <WastePollutionIcon {...iconProps} />;
    case QuestionCategory.CLIMATE_CHANGE:
      return <ClimateChangeIcon {...iconProps} />; 
    case QuestionCategory.SOCIAL_RESPONSIBILITY:
      return <SocialResponsibilityIcon {...iconProps} />; 
    case QuestionCategory.BUSINESS_MANAGEMENT:
      return <BusinessManagementIcon {...iconProps} />;
    default:
      return <SparklesIcon {...iconProps} />; 
  }
};

const escapeCsvCell = (cellData: string | number | undefined | null): string => {
  if (cellData === null || cellData === undefined) {
    return '';
  }
  const stringData = String(cellData);
  if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
    return `"${stringData.replace(/"/g, '""')}"`;
  }
  return stringData;
};

const parseMarkdown = (text: string): string => {
  let html = text;
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '<em>$1</em>');
  return html;
};

const renderRecommendations = (recs: string): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  const lines = recs.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const mainItemMatch = line.match(/^(?:(?:[০-৯]+|[0-9]+)\.\s*|\*\s+|•\s+)(.*)/);

    if (mainItemMatch) {
      const currentListItems: React.ReactNode[] = [];
      while (i < lines.length) {
        const currentLineForList = lines[i].trim();
        const currentMainItemMatch = currentLineForList.match(/^(?:(?:[০-৯]+|[0-9]+)\.\s*|\*\s+|•\s+)(.*)/);
        
        if (currentMainItemMatch) {
          let itemContent = currentMainItemMatch[1];
          const subBullets: string[] = [];
          let subBulletIndex = i + 1;

          while (subBulletIndex < lines.length && lines[subBulletIndex].trim().startsWith('* ')) {
            subBullets.push(lines[subBulletIndex].trim().substring(2)); 
            subBulletIndex++;
          }
          
          currentListItems.push(
            <li key={`main-item-${elements.length}-${currentListItems.length}`} className="flex items-start mb-2">
              <ListItemMarkerIcon className="w-3 h-3 text-s-teal-dark mr-3 mt-[7px] flex-shrink-0" />
              <div className="flex-grow">
                <p className="text-text-secondary print-text-black leading-relaxed inline" dangerouslySetInnerHTML={{ __html: parseMarkdown(itemContent) }} />
                {subBullets.length > 0 && (
                  <ul className="list-none pl-5 mt-1.5 space-y-1">
                    {subBullets.map((sub, subIdx) => (
                      <li key={`sub-${currentListItems.length}-${subIdx}`} className="flex items-start">
                        <span className="text-s-teal-dark print-text-black mr-2.5 pt-[3px] shrink-0">&#8226;</span>
                        <p className="flex-grow leading-relaxed text-text-secondary print-text-black" dangerouslySetInnerHTML={{ __html: parseMarkdown(sub) }} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
          i = subBulletIndex; 
        } else {
          break; 
        }
      }
      if (currentListItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="space-y-1 list-none recommendations-print pl-1 mb-3">
            {currentListItems}
          </ul>
        );
      }
    } else if (line) { 
      elements.push(
        <p 
          key={`para-${elements.length}`} 
          className="leading-relaxed text-text-secondary print-text-black my-3"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(line) }} 
        />
      );
      i++;
    } else { 
      i++;
    }
  }
  return elements;
};

const sanitizeFilenamePart = (name: string | undefined | null): string => {
  if (!name || typeof name !== 'string') return 'unknown';
  return name
    .trim()
    .replace(/\s+/g, '_') 
    .replace(/[^\w\u0980-\u09FF.-]/g, ''); // Keep word chars (alphanumeric + _), Bengali, dot, hyphen
};

const ResultsContent: React.FC<ResultsDisplayProps & { percentage: number, scoreColorClass: string }> = ({
  score,
  maxPossibleScore,
  recommendations,
  isLoadingRecommendations,
  answers,
  preAssessmentData,
  percentage,
  scoreColorClass,
}) => {
  const animatedScore = useCountUp(percentage);

  const getCategoryScores = () => {
    if (!preAssessmentData) return [];
    const categoryDataMap: Record<string, { weightedScore: number; weightedMaxScore: number }> = {};

    answers.forEach(answer => {
      if (!categoryDataMap[answer.category]) {
        categoryDataMap[answer.category] = { weightedScore: 0, weightedMaxScore: 0 };
      }
      const businessTypeWeights = QUESTION_WEIGHTS_BY_BUSINESS_TYPE[preAssessmentData.businessType];
      const weight = businessTypeWeights?.[answer.questionId] ?? 1.0;
      
      categoryDataMap[answer.category].weightedScore += answer.score * weight;
      categoryDataMap[answer.category].weightedMaxScore += MAX_SCORE_PER_QUESTION * weight;
    });

    return Object.entries(categoryDataMap).map(([category, data]) => ({
      categoryName: category as QuestionCategory,
      score: data.weightedScore, 
      maxScore: data.weightedMaxScore,
      percentage: data.weightedMaxScore > 0 ? Math.round((data.weightedScore / data.weightedMaxScore) * 100) : 0
    }));
  };

  const categoryBreakdown = getCategoryScores();
  const strengths = categoryBreakdown.filter(cat => cat.percentage >= 70);
  const improvements = categoryBreakdown.filter(cat => cat.percentage < 60);

  return (
    <div className="bg-bg-offset p-6 sm:p-8 md:p-10 rounded-xl shadow-soft-lg results-display-container">
      {/* --- HEADER --- */}
      <div className="text-center border-b-2 border-border-color pb-6 mb-8 animated-component animate-slide-fade-in">
        <ScoreTrophyIcon className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 ${scoreColorClass}`} />
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary print-text-black mb-2">আপনার মূল্যায়ন ফলাফল</h2>
        <p className="text-md sm:text-lg text-text-secondary print-text-black">আপনার ব্যবসার সবুজ পারফরম্যান্সের একটি সার্বিক চিত্র।</p>
        {preAssessmentData && (
            <p className="text-xs sm:text-sm text-text-secondary print-text-black mt-4 bg-disabled-bg print-bg-white px-3 py-1.5 rounded-full inline-block">
              <strong>ব্যবসা:</strong> {preAssessmentData.businessName} ({preAssessmentData.businessType}, {preAssessmentData.location})
            </p>
        )}
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN: SCORE & INSIGHTS --- */}
        <div className="lg:col-span-1 space-y-8">
          {/* --- SCORE SUMMARY BLOCK --- */}
          <div className="bg-gradient-to-br from-s-teal-light/20 to-p-green-light/20 print-bg-white p-6 rounded-lg shadow-soft print-no-shadow print-border text-center animated-component animate-slide-fade-in animation-delay-100">
            <p className="text-xl text-s-teal-dark print-text-black font-semibold mb-2">
              আপনার সামগ্রিক সবুজ স্কোর
            </p>
            <p className={`text-7xl font-bold my-1 ${scoreColorClass}`}>
              {animatedScore}<span className="text-4xl text-text-secondary print-text-black">/১০০</span>
            </p>
            <div className="relative my-4 inline-block circular-progress-print">
              <CircularProgress percentage={percentage} size={160} strokeWidth={16} colorClass={scoreColorClass} />
              <span className="hidden circular-progress-print-text print-text-black">{percentage}%</span>
            </div>
            <p className="text-xs text-text-muted print-text-black mt-1">
              (ভারযুক্ত স্কোর: {score.toFixed(2)} / {maxPossibleScore.toFixed(2)})
            </p>
          </div>
          
          {/* --- KEY INSIGHTS (STRENGTHS & IMPROVEMENTS) --- */}
          <div className="text-left p-6 bg-bg-main print-bg-white rounded-lg shadow-soft print-no-shadow print-border animated-component animate-slide-fade-in animation-delay-200">
              <h3 className="text-xl font-semibold text-text-primary print-text-black mb-5 text-center">একনজরে আপনার ফলাফল</h3>
              <div className="space-y-6">
                  {strengths.length > 0 && (
                      <div className="print-break-inside-avoid">
                          <h4 className="text-lg font-semibold text-p-green print-text-black mb-3 flex items-center">
                              <TrendingUpIcon className="w-6 h-6 mr-2.5"/> আপনার সাফল্যের ক্ষেত্র
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {strengths.map(cat => (
                                  <span key={`strength-${cat.categoryName}`} className="text-sm text-text-secondary print-text-black p-2 bg-p-green-light/40 print-bg-white rounded border border-p-green-light print-border">
                                      {cat.categoryName} ({cat.percentage}%)
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}
                  {improvements.length > 0 && (
                      <div className="print-break-inside-avoid">
                          <h4 className="text-lg font-semibold text-orange-500 print-text-black mb-3 flex items-center">
                              <WrenchScrewdriverIcon className="w-6 h-6 mr-2.5"/> উন্নতির সেরা সুযোগ
                          </h4>
                          <div className="flex flex-wrap gap-2">
                              {improvements.map(cat => (
                                  <span key={`improve-${cat.categoryName}`} className="text-sm text-text-secondary print-text-black p-2 bg-orange-500/20 print-bg-white rounded border border-orange-500/40 print-border">
                                      {cat.categoryName} ({cat.percentage}%)
                                  </span>
                              ))}
                          </div>
                      </div>
                  )}
                  {strengths.length === 0 && improvements.length === 0 && (
                      <p className="text-text-secondary print-text-black text-center py-4">কোনো নির্দিষ্ট শক্তিশালী দিক বা উন্নতির সুযোগ চিহ্নিত করা যায়নি।</p>
                  )}
              </div>
          </div>
        </div>
        
        {/* --- RIGHT COLUMN: DETAILS & RECOMMENDATIONS --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* --- DETAILED BREAKDOWN --- */}
          <div className="text-left print-break-inside-avoid animated-component animate-slide-fade-in animation-delay-300">
            <h3 className="text-xl font-semibold text-text-primary print-text-black mb-4">বিভাগভিত্তিক বিস্তারিত স্কোর</h3>
            <div className="space-y-4">
              {categoryBreakdown.map(cat => {
                const performanceColor = cat.percentage >= 70 ? 'bg-p-green' : cat.percentage >= 40 ? 'bg-yellow-400' : 'bg-red-400';
                return (
                  <div key={cat.categoryName} className="p-4 bg-bg-main print-bg-white rounded-lg border border-border-color print-border shadow-soft print-no-shadow transition-all hover:shadow-soft-lg flex items-start space-x-4">
                    <div className={`w-1.5 h-auto self-stretch rounded-full ${performanceColor}`}></div>
                    <div className="flex-grow">
                      <div className="flex items-center mb-2">
                        {getCategoryIcon(cat.categoryName)}
                        <div className="flex-grow">
                          <span className="font-semibold text-md text-s-teal-dark print-text-black">{cat.categoryName}</span>
                        </div>
                        <span className="text-sm text-text-primary print-text-black font-medium bg-disabled-bg print-bg-white px-2.5 py-1 rounded-full">
                            {cat.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-border-color print-bg-white rounded-full h-2.5 shadow-inner overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-700 ease-out ${performanceColor}`} 
                          style={{ width: `${cat.percentage}%` }}
                          role="progressbar"
                          aria-valuenow={cat.percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${cat.categoryName} অগ্রগতি ${cat.percentage}%`}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- RECOMMENDATIONS --- */}
          <div className="bg-bg-main print-bg-white p-6 sm:p-8 rounded-xl text-left shadow-soft print-no-shadow print-border print-break-inside-avoid animated-component animate-slide-fade-in animation-delay-400">
            <div className="flex items-center mb-5">
              <RecommendationsIcon className="w-8 h-8 text-s-teal-dark print-text-black mr-3 flex-shrink-0" />
              <h3 className="text-xl font-semibold text-text-primary print-text-black">আপনার জন্য ব্যক্তিগতকৃত সুপারিশ</h3>
            </div>
            {isLoadingRecommendations && !recommendations ? (
              <div className="py-5 no-print pdf-hide-on-capture">
                <RecommendationSkeleton />
                <p className="text-s-teal-dark text-center mt-6">জেমিনি এআই দিয়ে উপযুক্ত পরামর্শ তৈরি করা হচ্ছে...</p>
              </div>
            ) : recommendations ? (
              <div className="recommendations-print">
                {renderRecommendations(recommendations)}
              </div>
            ) : (
              <p className="text-text-secondary print-text-black">এই মুহূর্তে কোনো সুপারিশ উপলব্ধ নেই। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = (props) => {
  const {
    score,
    maxPossibleScore,
    onRestart,
    preAssessmentData,
  } = props;
  
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const percentage = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;
  
  let scoreColorClass = 'text-red-500 print-text-black';
  if (percentage >= 75) scoreColorClass = 'text-p-green print-text-black';
  else if (percentage >= 50) scoreColorClass = 'text-yellow-500 print-text-black';
  else if (percentage >= 25) scoreColorClass = 'text-orange-500 print-text-black';
  
  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    
    setTimeout(async () => {
      const captureElement = pdfContentRef.current;
      if (!captureElement) {
        console.error("PDF content element not found.");
        setIsGeneratingPdf(false);
        return;
      }
    
      try {
        const canvas = await html2canvas(captureElement, { 
          scale: 1.5,
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps= pdf.getImageProperties(imgData);
        const canvasWidth = imgProps.width;
        const canvasHeight = imgProps.height;

        const ratio = canvasHeight / canvasWidth;
        let position = 0;
        const pageHeight = pdfPageWidth * ratio; 
        
        let heightLeft = pageHeight;
        
        pdf.addImage(imgData, 'JPEG', 0, position, pdfPageWidth, pageHeight);
        heightLeft -= pdfPageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfPageWidth, pageHeight);
          heightLeft -= pdfPageHeight;
        }

        const sanitizedBusinessName = sanitizeFilenamePart(preAssessmentData?.businessName);
        const sanitizedLocation = sanitizeFilenamePart(preAssessmentData?.location);
        pdf.save(`সবুজ_ব্যবসা_ফলাফল_${sanitizedBusinessName}_${sanitizedLocation}.pdf`);

      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("পিডিএফ তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 100); // Timeout to allow React to render the off-screen component
  };
  
  const handleDownloadCSV = () => {
    if (!preAssessmentData) return;

    const headers = [
      "বিভাগের নাম (Section)", 
      "তথ্য (Information)", 
      "মান (Value)"
    ];
    
    let csvContent = "\uFEFF"; 
    csvContent += headers.map(escapeCsvCell).join(',') + '\n';

    csvContent += [escapeCsvCell("ব্যবসার তথ্য"), escapeCsvCell("ব্যবসার নাম"), escapeCsvCell(preAssessmentData.businessName)].join(',') + '\n';
    csvContent += [escapeCsvCell("ব্যবসার তথ্য"), escapeCsvCell("ব্যবসার ধরণ"), escapeCsvCell(preAssessmentData.businessType)].join(',') + '\n';
    csvContent += [escapeCsvCell("ব্যবসার তথ্য"), escapeCsvCell("অবস্থান"), escapeCsvCell(preAssessmentData.location)].join(',') + '\n';
    csvContent += [escapeCsvCell("ব্যবসার তথ্য"), escapeCsvCell("কর্মী সংখ্যা"), escapeCsvCell(preAssessmentData.employeeCount)].join(',') + '\n';
    if (preAssessmentData.businessDescription) {
      csvContent += [escapeCsvCell("ব্যবসার তথ্য"), escapeCsvCell("ব্যবসার সংক্ষিপ্ত বিবরণ"), escapeCsvCell(preAssessmentData.businessDescription)].join(',') + '\n';
    }
    if (preAssessmentData.mainChallengeOrGoal) {
      csvContent += [escapeCsvCell("ব্যবসার তথ্য"), escapeCsvCell("প্রধান চ্যালেঞ্জ/লক্ষ্য"), escapeCsvCell(preAssessmentData.mainChallengeOrGoal)].join(',') + '\n';
    }
    
    csvContent += [escapeCsvCell("সামগ্রিক স্কোর"), escapeCsvCell("মোট সবুজ স্কোর (১০০ এর মধ্যে)"), escapeCsvCell(percentage)].join(',') + '\n';
    csvContent += [escapeCsvCell("সামগ্রিক স্কোর"), escapeCsvCell("মোট স্কোর (ভারযুক্ত)"), escapeCsvCell(score.toFixed(2))].join(',') + '\n';
    csvContent += [escapeCsvCell("সামগ্রিক স্কোর"), escapeCsvCell("সর্বোচ্চ সম্ভাব্য স্কোর (ভারযুক্ত)"), escapeCsvCell(maxPossibleScore.toFixed(2))].join(',') + '\n';
    
    const categoryBreakdown = props.answers.reduce((acc, answer) => {
        if (!acc[answer.category]) {
            // FIX: Removed unused 'count' property which was causing a TypeScript error.
            acc[answer.category] = { score: 0, maxScore: 0 };
        }
        const weight = QUESTION_WEIGHTS_BY_BUSINESS_TYPE[preAssessmentData.businessType]?.[answer.questionId] ?? 1.0;
        acc[answer.category].score += answer.score * weight;
        acc[answer.category].maxScore += MAX_SCORE_PER_QUESTION * weight;
        return acc;
    }, {} as Record<string, { score: number, maxScore: number }>);

    csvContent += [escapeCsvCell("বিভাগভিত্তিক স্কোর"), escapeCsvCell("বিভাগের নাম"), escapeCsvCell("প্রাপ্ত স্কোর (ভারযুক্ত)"), escapeCsvCell("বিভাগের সর্বোচ্চ স্কোর (ভারযুক্ত)"), escapeCsvCell("শতাংশ")].join(',') + '\n';
    Object.entries(categoryBreakdown).forEach(([category, data]) => {
      const catPercentage = data.maxScore > 0 ? Math.round((data.score / data.maxScore) * 100) : 0;
      csvContent += [
        escapeCsvCell("বিভাগভিত্তিক স্কোর"), 
        escapeCsvCell(category), 
        escapeCsvCell(data.score.toFixed(2)), 
        escapeCsvCell(data.maxScore.toFixed(2)), 
        escapeCsvCell(catPercentage + "%")
      ].join(',') + '\n';
    });

    csvContent += [escapeCsvCell("প্রশ্নের উত্তর"), escapeCsvCell("প্রশ্ন"), escapeCsvCell("বিভাগ"), escapeCsvCell("উত্তর (স্কোর)"), escapeCsvCell("ওজন (Weight)")].join(',') + '\n';
     props.answers.forEach(ans => {
      const businessTypeWeights = QUESTION_WEIGHTS_BY_BUSINESS_TYPE[preAssessmentData.businessType];
      const weight = businessTypeWeights?.[ans.questionId] ?? 1.0;
      csvContent += [
        escapeCsvCell("প্রশ্নের উত্তর"),
        escapeCsvCell(ans.text),
        escapeCsvCell(ans.category),
        escapeCsvCell(ans.score),
        escapeCsvCell(weight.toFixed(2))
      ].join(',') + '\n';
    });

    const formattedRecommendations = props.recommendations.replace(/\n\n+/g, " || ").replace(/\n/g, " ; ");
    csvContent += [escapeCsvCell("ব্যক্তিগতকৃত সুপারিশ"), escapeCsvCell("সুপারিশ (Recommendations)"), escapeCsvCell(formattedRecommendations)].join(',') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const sanitizedBusinessName = sanitizeFilenamePart(preAssessmentData?.businessName);
      const sanitizedLocation = sanitizeFilenamePart(preAssessmentData?.location);
      link.setAttribute("download", `সবুজ_ব্যবসা_বিস্তারিত_ফলাফল_${sanitizedBusinessName}_${sanitizedLocation}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  const commonButtonClasses = "flex items-center justify-center w-full sm:w-auto font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-60 disabled:opacity-50 disabled:cursor-not-allowed";
  const iconSizeClass = "w-6 h-6 mr-2 sm:mr-2.5";

  return (
    <div className="w-full max-w-6xl print-container">
      {/* Off-screen container for PDF generation */}
      {isGeneratingPdf && preAssessmentData && (
         <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '297mm', backgroundColor: 'white' }}>
          <div ref={pdfContentRef}>
            <Certificate 
              businessName={preAssessmentData.businessName}
              percentage={percentage}
              assessmentDate={new Date()}
            />
            <div className="pdf-page-break" style={{height: '1px'}}></div>
            <ResultsContent {...props} percentage={percentage} scoreColorClass={scoreColorClass} />
          </div>
        </div>
      )}

      {/* Visible UI */}
       <div className={`transition-opacity duration-300 ${isGeneratingPdf ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
         <ResultsContent {...props} percentage={percentage} scoreColorClass={scoreColorClass} />
         <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 results-actions-no-print pdf-hide-on-capture animated-component animate-slide-fade-in animation-delay-500">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className={`${commonButtonClasses} bg-accent-gold hover:bg-yellow-600 focus:ring-accent-gold text-text-primary`}
              aria-label="ফলাফল পিডিএফ হিসাবে ডাউনলোড করুন"
            >
              <ArrowDownTrayIcon className={iconSizeClass} />
              PDF ডাউনলোড
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={isGeneratingPdf}
              className={`${commonButtonClasses} bg-s-teal hover:bg-s-teal-dark focus:ring-s-teal text-white`}
              aria-label="বিস্তারিত ডেটা সিএসভি হিসাবে ডাউনলোড করুন"
            >
              <ArrowDownTrayIcon className={iconSizeClass} />
              CSV ডাউনলোড
            </button>
            <button
              onClick={onRestart}
              disabled={isGeneratingPdf}
              className={`${commonButtonClasses} bg-p-green-dark hover:bg-green-700 focus:ring-p-green-dark text-white`}
              aria-label="মূল্যায়ন পুনরায় শুরু করুন"
            >
              <RestartIcon className={iconSizeClass} />
              পুনরায় শুরু
            </button>
          </div>
       </div>

      {/* Full-screen loader during PDF generation */}
      {isGeneratingPdf && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 no-print">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-s-teal-dark font-semibold animate-pulse">
            আপনার সার্টিফিকেট ও ফলাফল প্রস্তুত করা হচ্ছে...
          </p>
        </div>
      )}
    </div>
  );
};