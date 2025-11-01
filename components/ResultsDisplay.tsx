import React, { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoadingSpinner } from './LoadingSpinner';
import { QuestionCategory } from '../types';
import type { Answer, PreAssessmentData } from '../types'; 
import { MAX_SCORE_PER_QUESTION, QUESTION_WEIGHTS_BY_BUSINESS_TYPE } from '../constants'; 
import { CircularProgress } from './CircularProgress';
import { 
  ResourceEfficiencyIcon, 
  WastePollutionIcon, 
  SocialResponsibilityIcon,
  ClimateChangeIcon,
  BusinessManagementIcon,
  SparklesIcon,
} from './CategoryIcons';

interface ResultsDisplayProps {
  score: number; // This will be the weighted total score
  maxPossibleScore: number; // This will be the weighted max possible score
  recommendations: string;
  isLoadingRecommendations: boolean;
  onRestart: () => void;
  answers: Answer[];
  preAssessmentData: PreAssessmentData | null; 
}

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

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a12.06 12.06 0 01-4.5 0M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M12 6a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
  </svg>
);

const ListItemMarkerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className || "w-2.5 h-2.5"} aria-hidden="true">
    <path d="M8 .25a.75.75 0 0 1 .67.418l3.5 7a.75.75 0 0 1-1.34.664L8 2.73 4.17 8.332a.75.75 0 0 1-1.34-.664l3.5-7A.75.75 0 0 1 8 .25Z" />
  </svg>
);

const getCategoryIcon = (categoryName: QuestionCategory): React.ReactNode => {
  const iconProps = { className: "w-7 h-7 mr-3 text-s-teal-dark" };
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


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  score, // weightedTotalScore
  maxPossibleScore, // weightedMaxPossibleScore
  recommendations,
  isLoadingRecommendations,
  onRestart,
  answers,
  preAssessmentData 
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const percentage = maxPossibleScore > 0 ? Math.round((score / maxPossibleScore) * 100) : 0;
  
  let scoreColorClass = 'text-red-500 print-text-black'; // Default to Tailwind's red-500
  if (percentage >= 75) scoreColorClass = 'text-p-green print-text-black';
  else if (percentage >= 50) scoreColorClass = 'text-yellow-500 print-text-black'; // Tailwind's yellow-500
  else if (percentage >= 25) scoreColorClass = 'text-orange-500 print-text-black'; // Tailwind's orange-500

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
  
  const handleDownloadPDF = async () => {
    if (!resultsRef.current) return;
    setIsGeneratingPdf(true);
    
    const originalStyles: {element: HTMLElement, styleName: string, originalValue: string}[] = [];
    const captureElement = resultsRef.current;

    captureElement.classList.add('pdf-capture-mode');
    const elementsToForceWhiteBG = captureElement.querySelectorAll('.bg-gradient-to-r, .bg-bg-main, .bg-disabled-bg, .bg-p-green-light, .bg-s-teal-light');
    elementsToForceWhiteBG.forEach(el => {
        const htmlEl = el as HTMLElement;
        originalStyles.push({element: htmlEl, styleName: 'backgroundColor', originalValue: htmlEl.style.backgroundColor});
        htmlEl.style.backgroundColor = '#ffffff';
    });

    try {
      const canvas = await html2canvas(captureElement, { 
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (document) => {
          const elementsToHideInPdf = document.querySelectorAll('.pdf-hide-on-capture');
          elementsToHideInPdf.forEach(el => (el as HTMLElement).style.display = 'none');
          const svgTextFallbacks = document.querySelectorAll('.circular-progress-print-text');
          svgTextFallbacks.forEach(el => (el as HTMLElement).style.display = 'block');
          const svgElements = document.querySelectorAll('.circular-progress-print svg');
          svgElements.forEach(el => (el as HTMLElement).style.display = 'none');
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; 

      const imgProps= pdf.getImageProperties(imgData);
      const canvasWidth = imgProps.width;
      const canvasHeight = imgProps.height;

      const availableWidth = pdfPageWidth - 2 * margin;
      const scaleRatio = availableWidth / canvasWidth;
      const scaledCanvasHeight = canvasHeight * scaleRatio;
      
      let position = 0;
      while (position < scaledCanvasHeight) {
        const pageImageHeight = Math.min(pdfPageHeight - 2 * margin, scaledCanvasHeight - position);
        pdf.addImage(imgData, 'PNG', margin, margin - position, availableWidth, scaledCanvasHeight);
        position += (pdfPageHeight - 2 * margin);
        if (position < scaledCanvasHeight) {
          pdf.addPage();
        }
      }
      
      const sanitizedBusinessName = sanitizeFilenamePart(preAssessmentData?.businessName);
      const sanitizedLocation = sanitizeFilenamePart(preAssessmentData?.location);
      pdf.save(`GB_Toolkit_Result_${sanitizedBusinessName}_${sanitizedLocation}.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("পিডিএফ তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      captureElement.classList.remove('pdf-capture-mode');
      originalStyles.forEach(s => (s.element.style as any)[s.styleName] = s.originalValue);
      setIsGeneratingPdf(false);
    }
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
    
    csvContent += [escapeCsvCell("বিভাগভিত্তিক স্কোর"), escapeCsvCell("বিভাগের নাম"), escapeCsvCell("প্রাপ্ত স্কোর (ভারযুক্ত)"), escapeCsvCell("বিভাগের সর্বোচ্চ স্কোর (ভারযুক্ত)"), escapeCsvCell("শতাংশ")].join(',') + '\n';
    categoryBreakdown.forEach(cat => {
      csvContent += [
        escapeCsvCell("বিভাগভিত্তিক স্কোর"), 
        escapeCsvCell(cat.categoryName), 
        escapeCsvCell(cat.score.toFixed(2)), 
        escapeCsvCell(cat.maxScore.toFixed(2)), 
        escapeCsvCell(cat.percentage + "%")
      ].join(',') + '\n';
    });

    csvContent += [escapeCsvCell("প্রশ্নের উত্তর"), escapeCsvCell("প্রশ্ন"), escapeCsvCell("বিভাগ"), escapeCsvCell("উত্তর (স্কোর)"), escapeCsvCell("ওজন")].join(',') + '\n';
     answers.forEach(ans => {
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

    const formattedRecommendations = recommendations.replace(/\n\n+/g, " || ").replace(/\n/g, " ; ");
    csvContent += [escapeCsvCell("ব্যক্তিগতকৃত সুপারিশ"), escapeCsvCell("সুপারিশ"), escapeCsvCell(formattedRecommendations)].join(',') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const sanitizedBusinessName = sanitizeFilenamePart(preAssessmentData?.businessName);
      const sanitizedLocation = sanitizeFilenamePart(preAssessmentData?.location);
      link.setAttribute("download", `GB_Toolkit_Result_Detailed_${sanitizedBusinessName}_${sanitizedLocation}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  const commonButtonClasses = "flex items-center justify-center w-full sm:w-auto font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-60 disabled:opacity-50 disabled:cursor-not-allowed";
  const iconSizeClass = "w-7 h-7 mr-2 sm:mr-2.5"; // Consistent icon size

  return (
    <div ref={resultsRef} className="w-full max-w-3xl bg-bg-offset p-6 sm:p-8 md:p-10 rounded-xl shadow-soft-lg text-center animate-slideInUp results-display-container print-container">
      {/* --- HEADER --- */}
      <div className="flex flex-col items-center mb-6">
        <ScoreTrophyIcon className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 ${scoreColorClass}`} />
        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary print-text-black mb-2">মূল্যায়ন সম্পন্ন!</h2>
        <p className="text-md sm:text-lg text-text-secondary print-text-black">আপনার ব্যবসার সবুজ পারফরম্যান্সের সারসংক্ষেপ নিচে দেওয়া হলো।</p>
        {preAssessmentData && (
            <p className="text-xs sm:text-sm text-text-secondary print-text-black mt-3 bg-disabled-bg print-bg-white px-3 py-1.5 rounded-full">
              ব্যবসা: <span className="font-semibold">{preAssessmentData.businessName}</span> ({preAssessmentData.businessType}, {preAssessmentData.location})
            </p>
        )}
      </div>

       {/* --- SCORE SUMMARY BLOCK --- */}
      <div className="bg-gradient-to-r from-p-green-light/50 to-s-teal-light/50 print-bg-white p-6 rounded-lg mb-10 shadow-soft print-no-shadow print-border flex flex-col md:flex-row items-center justify-around space-y-6 md:space-y-0 md:space-x-8">
        <div className="text-center md:text-left">
          <p className="text-lg sm:text-xl text-s-teal-dark print-text-black font-semibold">
            আপনার মোট সবুজ স্কোর:
          </p>
          <p className={`text-5xl sm:text-7xl font-bold my-1 ${scoreColorClass}`}>
            {percentage}<span className="text-3xl sm:text-5xl text-text-secondary print-text-black">/১০০</span>
          </p>
          <p className="text-xs text-text-muted print-text-black mt-1">
            (ভারযুক্ত স্কোর: {score.toFixed(2)} / {maxPossibleScore.toFixed(2)})
          </p>
        </div>
        <div className="relative animate-subtle-beat circular-progress-print">
           <CircularProgress percentage={percentage} size={140} strokeWidth={14} colorClass={scoreColorClass} />
           <span className="hidden circular-progress-print-text print-text-black">{percentage}%</span>
        </div>
      </div>

      {/* --- KEY INSIGHTS (STRENGTHS & IMPROVEMENTS) --- */}
      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="mb-10 text-left p-6 bg-bg-main print-bg-white rounded-lg shadow-soft print-no-shadow print-border">
            <h3 className="text-xl sm:text-2xl font-semibold text-text-primary print-text-black mb-5 text-center">একনজরে আপনার ফলাফল</h3>
            <div className="grid md:grid-cols-2 gap-6">
                {strengths.length > 0 && (
                    <div className="print-break-inside-avoid">
                        <h4 className="text-lg font-semibold text-p-green print-text-black mb-3 flex items-center">
                            <CheckCircleIcon className="w-6 h-6 mr-2"/> শক্তিশালী দিকসমূহ
                        </h4>
                        <ul className="space-y-2 list-inside">
                            {strengths.map(cat => (
                                <li key={`strength-${cat.categoryName}`} className="text-sm text-text-secondary print-text-black p-2 bg-p-green-light/40 print-bg-white rounded border border-p-green-light print-border">
                                    {cat.categoryName} ({cat.percentage}%)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {improvements.length > 0 && (
                     <div className="print-break-inside-avoid">
                        <h4 className="text-lg font-semibold text-orange-500 print-text-black mb-3 flex items-center">
                             <LightbulbIcon className="w-6 h-6 mr-2"/> উন্নতির সুযোগ রয়েছে
                        </h4>
                        <ul className="space-y-2 list-inside">
                            {improvements.map(cat => (
                                <li key={`improve-${cat.categoryName}`} className="text-sm text-text-secondary print-text-black p-2 bg-orange-500/20 print-bg-white rounded border border-orange-500/40 print-border">
                                    {cat.categoryName} ({cat.percentage}%)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* --- DETAILED BREAKDOWN --- */}
      <div className="mb-10 text-left print-break-inside-avoid">
        <h3 className="text-xl sm:text-2xl font-semibold text-text-primary print-text-black mb-5 text-center">বিভাগভিত্তিক বিস্তারিত স্কোর</h3>
        <div className="space-y-5">
          {categoryBreakdown.map(cat => (
            <div key={cat.categoryName} className="p-4 sm:p-5 bg-bg-main print-bg-white rounded-xl border border-border-color print-border shadow-soft print-no-shadow transition-all hover:shadow-soft-lg category-breakdown-item-print">
              <div className="flex items-center mb-2.5">
                {getCategoryIcon(cat.categoryName)}
                <div className="flex-grow">
                  <span className="font-semibold text-md sm:text-lg text-s-teal-dark print-text-black">{cat.categoryName}</span>
                </div>
                <span className="text-xs sm:text-sm text-text-secondary print-text-black font-medium bg-disabled-bg print-bg-white px-2 py-0.5 rounded">
                    {cat.score.toFixed(2)} / {cat.maxScore.toFixed(2)} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-border-color print-bg-white rounded-full h-3 shadow-inner overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ease-out print-bg-white border print-border
                              ${cat.percentage >= 70 ? 'bg-p-green border-p-green-dark' : cat.percentage >= 40 ? 'bg-yellow-400 border-yellow-500' : 'bg-red-400 border-red-500'}`} 
                  style={{ width: `${cat.percentage}%` }}
                  role="progressbar"
                  aria-valuenow={cat.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${cat.categoryName} progress ${cat.percentage}%`}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RECOMMENDATIONS --- */}
      <div className="bg-bg-main print-bg-white p-6 sm:p-8 rounded-xl text-left mb-10 shadow-soft print-no-shadow print-border print-break-inside-avoid">
        <div className="flex items-center mb-5">
          <RecommendationsIcon className="w-8 h-8 text-s-teal-dark print-text-black mr-3 flex-shrink-0" />
          <h3 className="text-xl sm:text-2xl font-semibold text-text-primary print-text-black">আপনার জন্য ব্যক্তিগতকৃত সুপারিশ</h3>
        </div>
        {isLoadingRecommendations && !recommendations ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-10 no-print pdf-hide-on-capture">
            <LoadingSpinner />
            <p className="text-s-teal-dark animate-pulse">জেমিনি এআই দিয়ে উপযুক্ত পরামর্শ তৈরি করা হচ্ছে...</p>
          </div>
        ) : recommendations ? (
          <div className="recommendations-print">
            {renderRecommendations(recommendations)}
          </div>
        ) : (
          <p className="text-text-secondary print-text-black">এই মুহূর্তে কোনো সুপারিশ উপলব্ধ নেই। অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>
        )}
      </div>
      
       {/* --- ACTIONS --- */}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 results-actions-no-print pdf-hide-on-capture">
        {isGeneratingPdf && (
          <div className="text-accent-gold flex items-center justify-center py-3 px-6">
            <LoadingSpinner /> 
            <span className="ml-2">পিডিএফ তৈরি করা হচ্ছে...</span>
          </div>
        )}
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className={`${commonButtonClasses} bg-accent-gold hover:bg-yellow-600 focus:ring-accent-gold text-text-primary`}
        >
          <ArrowDownTrayIcon className={iconSizeClass} />
          ফলাফল PDF ডাউনলোড করুন
        </button>
        <button
          onClick={handleDownloadCSV}
          disabled={isGeneratingPdf}
          className={`${commonButtonClasses} bg-s-teal hover:bg-s-teal-dark focus:ring-s-teal text-white`}
        >
          <ArrowDownTrayIcon className={iconSizeClass} />
          বিস্তারিত ডেটা CSV ডাউনলোড করুন
        </button>
        <button
          onClick={onRestart}
          disabled={isGeneratingPdf}
          className={`${commonButtonClasses} bg-p-green-dark hover:bg-green-700 focus:ring-p-green-dark text-white`}
        >
          <RestartIcon className={iconSizeClass} />
          পুনরায় শুরু করুন
        </button>
      </div>
    </div>
  );
};