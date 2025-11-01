import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QuestionCard } from './components/QuestionCard';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ProgressBar } from './components/ProgressBar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { PreAssessmentForm } from './components/PreAssessmentForm';
import { QuestionNavigator } from './components/QuestionNavigator';
import { WelcomeScreen } from './components/WelcomeScreen'; // Import WelcomeScreen
import { QUESTIONS, MAX_SCORE_PER_QUESTION, QUESTION_WEIGHTS_BY_BUSINESS_TYPE } from './constants';
import type { Question, Answer, PreAssessmentData } from './types';
import { getRecommendationsStream } from './services/geminiService';

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);


const App: React.FC = () => {
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(true); 
  const [preAssessmentData, setPreAssessmentData] = useState<PreAssessmentData | null>(null);
  const [isPreAssessmentDone, setIsPreAssessmentDone] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [weightedTotalScore, setWeightedTotalScore] = useState<number>(0);
  const [weightedMaxPossibleScore, setWeightedMaxPossibleScore] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Read the API key from the window object in the top-level component.
  const apiKey = (window as any).process?.env?.API_KEY;

  const calculateWeightedScore = useCallback((currentAnswers: Map<string, Answer>, currentPreAssessmentData: PreAssessmentData | null): number => {
    if (!currentPreAssessmentData) return 0;
    let score = 0;
    currentAnswers.forEach(answer => {
      const businessTypeWeights = QUESTION_WEIGHTS_BY_BUSINESS_TYPE[currentPreAssessmentData.businessType];
      const weight = businessTypeWeights?.[answer.questionId] ?? 1.0;
      score += answer.score * weight;
    });
    return score;
  }, []);

  const calculateDynamicWeightedMaxScore = useCallback((currentPreAssessmentData: PreAssessmentData | null): number => {
    if (!currentPreAssessmentData) return QUESTIONS.length * MAX_SCORE_PER_QUESTION; // Fallback, though should not happen
    let maxScore = 0;
    QUESTIONS.forEach(question => {
      const businessTypeWeights = QUESTION_WEIGHTS_BY_BUSINESS_TYPE[currentPreAssessmentData.businessType];
      const weight = businessTypeWeights?.[question.id] ?? 1.0;
      maxScore += MAX_SCORE_PER_QUESTION * weight;
    });
    return maxScore;
  }, []);

  useEffect(() => {
    if (preAssessmentData) {
        setWeightedTotalScore(calculateWeightedScore(answers, preAssessmentData));
        setWeightedMaxPossibleScore(calculateDynamicWeightedMaxScore(preAssessmentData));
    }
  }, [answers, preAssessmentData, calculateWeightedScore, calculateDynamicWeightedMaxScore]);
  
  const handleStartAssessment = () => {
    setShowWelcomeScreen(false);
  };

  const handlePreAssessmentSubmit = (data: PreAssessmentData) => {
    setPreAssessmentData(data);
    setIsPreAssessmentDone(true);
    setError(null); 
    // Initialize scores when preAssessmentData is set
    setWeightedMaxPossibleScore(calculateDynamicWeightedMaxScore(data));
    setWeightedTotalScore(calculateWeightedScore(answers, data));
  };

  const handleAnswer = (questionId: string, score: number) => {
    const newAnswers = new Map(answers);
    const question = QUESTIONS.find(q => q.id === questionId);
    if (question) {
      newAnswers.set(questionId, { questionId, score, text: question.text, category: question.category });
      setAnswers(newAnswers);
    }

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleGoBack = () => {
    if (isCompleted) {
      setIsCompleted(false); 
      setRecommendations(''); 
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    if (index >= 0 && index < QUESTIONS.length) {
      setCurrentQuestionIndex(index);
      if (isCompleted) {
        setIsCompleted(false); 
        setRecommendations(''); 
      }
    }
  };
  
  const fetchGeminiRecommendations = useCallback(async (
    currentWeightedTotalScore: number, 
    currentWeightedMaxScore: number,
    currentAnswers: Map<string, Answer>, 
    contextData: PreAssessmentData,
    apiKeyToUse?: string // Accept the API key as a parameter
  ) => {
    if (!apiKeyToUse) {
      setError("ত্রুটি: জেমিনি এপিআই কী অনুপস্থিত। অনুগ্রহ করে নিশ্চিত করুন এটি সঠিকভাবে সেট করা আছে।");
      return;
    }

    setIsLoadingRecommendations(true);
    setError(null);
    setRecommendations(''); // Clear previous recommendations before streaming
    try {
      const detailedAnswers = Array.from(currentAnswers.values());
      const percentageScore = currentWeightedMaxScore > 0 ? Math.round((currentWeightedTotalScore / currentWeightedMaxScore) * 100) : 0;
      const stream = await getRecommendationsStream(
        currentWeightedTotalScore, 
        currentWeightedMaxScore,
        percentageScore,
        detailedAnswers, 
        contextData,
        apiKeyToUse // Pass the key to the service
      );
      
      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setRecommendations(fullText);
        }
      }

    } catch (err) {
      console.error("Error fetching recommendations:", err);
      if (err instanceof Error) {
        setError(`সুপারিশ আনতে ব্যর্থ হয়েছে: ${err.message}। আপনার এপিআই কী সঠিকভাবে কনফিগার করা আছে কিনা তা নিশ্চিত করুন।`);
      } else {
        setError("সুপারিশ আনার সময় একটি অজানা ত্রুটি ঘটেছে।");
      }
      setRecommendations('');
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, []);


  useEffect(() => {
    if (isCompleted && preAssessmentData && !isLoadingRecommendations && recommendations === '') {
      const finalWeightedScore = calculateWeightedScore(answers, preAssessmentData);
      const finalWeightedMaxScore = calculateDynamicWeightedMaxScore(preAssessmentData);
      setWeightedTotalScore(finalWeightedScore);
      setWeightedMaxPossibleScore(finalWeightedMaxScore);
      // Pass the apiKey read from the component's scope
      fetchGeminiRecommendations(finalWeightedScore, finalWeightedMaxScore, answers, preAssessmentData, apiKey);
    }
  }, [isCompleted, answers, preAssessmentData, recommendations, isLoadingRecommendations, calculateWeightedScore, calculateDynamicWeightedMaxScore, fetchGeminiRecommendations, apiKey]);

  const restartAssessment = () => {
    setShowWelcomeScreen(true); 
    setIsPreAssessmentDone(false);
    setPreAssessmentData(null);
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setWeightedTotalScore(0);
    setWeightedMaxPossibleScore(0); // Reset this as well
    setIsCompleted(false);
    setIsLoadingRecommendations(false);
    setRecommendations('');
    setError(null);
  };

  const currentQuestion: Question | undefined = QUESTIONS[currentQuestionIndex];
  const progress = isPreAssessmentDone ? ((currentQuestionIndex + 1) / QUESTIONS.length) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col bg-bg-main">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center animate-fadeIn">
        {error && (
          <div 
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-2xl rounded-md shadow-soft flex items-start no-print" 
            role="alert"
          >
            <AlertIcon className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-700">ত্রুটি</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {showWelcomeScreen ? (
          <WelcomeScreen onStart={handleStartAssessment} />
        ) : !isPreAssessmentDone ? (
          <PreAssessmentForm onSubmit={handlePreAssessmentSubmit} />
        ) : !isCompleted && currentQuestion ? (
          <div className="w-full max-w-2xl bg-bg-offset p-6 sm:p-8 rounded-xl shadow-soft-lg animate-slideInUp no-print">
            <div className="progress-bar-no-print">
              <ProgressBar progress={progress} />
            </div>
            <div className="question-navigation-no-print">
              <QuestionNavigator 
                totalQuestions={QUESTIONS.length}
                currentQuestionIndex={currentQuestionIndex}
                onJump={handleJumpToQuestion}
                isDisabled={false}
              />
            </div>
            <QuestionCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              currentValue={answers.get(currentQuestion.id)?.score}
              onGoBack={handleGoBack}
              isFirstQuestion={currentQuestionIndex === 0}
            />
          </div>
        ) : isCompleted && preAssessmentData ? ( // Ensure preAssessmentData is not null
          <ResultsDisplay
            score={weightedTotalScore}
            maxPossibleScore={weightedMaxPossibleScore} // Pass weighted max score
            recommendations={recommendations}
            isLoadingRecommendations={isLoadingRecommendations}
            onRestart={restartAssessment}
            answers={Array.from(answers.values())}
            preAssessmentData={preAssessmentData}
          />
        ) : null}
      </main>
      <Footer />
    </div>
  );
};

export default App;