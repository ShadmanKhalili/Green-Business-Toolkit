
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
import { getRecommendations } from './services/geminiService';

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const AnimatedBackground: React.FC = () => (
  <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-bg-main">
    <div className="absolute top-[10vh] left-[5vw] w-[30vw] h-[30vw] bg-p-green-light/30 rounded-full filter blur-3xl opacity-50 animate-blob-move-1"></div>
    <div className="absolute top-[40vh] right-[10vw] w-[25vw] h-[25vw] bg-s-teal-light/30 rounded-full filter blur-3xl opacity-50 animate-blob-move-2"></div>
    <div className="absolute bottom-[5vh] left-[20vw] w-[20vw] h-[20vw] bg-accent-gold-light/30 rounded-full filter blur-3xl opacity-50 animate-blob-move-3"></div>
  </div>
);

const ApiKeyInstructions: React.FC = () => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 mb-6 w-full max-w-3xl rounded-md shadow-soft no-print" role="alert">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="ml-4">
        <h3 className="text-lg font-bold">জেমিনি এপিআই কী সেটআপ করুন</h3>
        <div className="mt-2 text-sm space-y-2">
          <p>
            মনে হচ্ছে আপনার Gemini API কী সেট করা নেই। চিন্তা করবেন না, এটি ঠিক করা সহজ! যেহেতু আপনি Netlify ব্যবহার করছেন, অনুগ্রহ করে এই ধাপগুলি অনুসরণ করুন:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>আপনার Netlify অ্যাকাউন্টে লগইন করুন এবং আপনার সাইটের ড্যাশবোর্ডে যান।</li>
            <li><strong>Site configuration</strong> &gt; <strong>Build &amp; deploy</strong> &gt; <strong>Environment</strong> এ যান।</li>
            <li><strong>Environment variables</strong> বিভাগে, <strong>"Add a variable"</strong> এ ক্লিক করুন।</li>
            <li>
              দুটি ক্ষেত্র পূরণ করুন:
              <ul className="list-disc list-inside ml-4 mt-1 bg-yellow-100 p-2 rounded">
                <li><strong>Key:</strong> <code className="font-mono bg-yellow-200 px-1 rounded">API_KEY</code> (সঠিকভাবে এই নামটিই ব্যবহার করুন)</li>
                <li><strong>Value:</strong> এখানে আপনার Gemini API কী পেস্ট করুন।</li>
              </ul>
            </li>
            <li><strong>Save</strong> করুন এবং তারপর আপনার সাইটটি পুনরায় ডিপ্লয় (redeploy) করতে <strong>"Trigger deploy"</strong> করুন।</li>
          </ol>
          <p className="mt-3">
            পুনরায় ডিপ্লয় করার পরে, কী উপলব্ধ হবে এবং অ্যাপটি সঠিকভাবে কাজ করবে। নিরাপত্তার জন্য, আপনার API কী সরাসরি কোডে লিখবেন না।
          </p>
        </div>
      </div>
    </div>
  </div>
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
  ) => {
    setIsLoadingRecommendations(true);
    setError(null);
    setRecommendations(''); // Clear previous recommendations before fetching
    try {
      const detailedAnswers = Array.from(currentAnswers.values());
      const percentageScore = currentWeightedMaxScore > 0 ? Math.round((currentWeightedTotalScore / currentWeightedMaxScore) * 100) : 0;
      const response = await getRecommendations(
        currentWeightedTotalScore, 
        currentWeightedMaxScore,
        percentageScore,
        detailedAnswers, 
        contextData,
      );
      
      const fullText = response.text;
      if (fullText) {
        setRecommendations(fullText);
      } else {
        setError("সুপারিশ আনতে ব্যর্থ হয়েছে: জেমিনি থেকে কোনো উত্তর পাওয়া যায়নি।");
      }

    } catch (err) {
      console.error("Error fetching recommendations:", err);
      if (err instanceof Error) {
        if (err.message.includes("এপিআই কী অনুপস্থিত")) {
          setError("API_KEY_MISSING");
        } else {
          setError(err.message);
        }
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
      fetchGeminiRecommendations(finalWeightedScore, finalWeightedMaxScore, answers, preAssessmentData);
    }
  }, [isCompleted, answers, preAssessmentData, recommendations, isLoadingRecommendations, calculateWeightedScore, calculateDynamicWeightedMaxScore, fetchGeminiRecommendations]);

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
    <div className="min-h-screen flex flex-col bg-transparent relative isolate">
      <AnimatedBackground />
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center animate-fadeIn">
        {error === "API_KEY_MISSING" ? (
          <ApiKeyInstructions />
        ) : error ? (
          <div 
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 w-full max-w-2xl rounded-md shadow-soft flex items-start no-print" 
            role="alert"
          >
            <div title="সতর্কতা">
              <AlertIcon className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" />
            </div>
            <div>
              <p className="font-bold text-red-700">ত্রুটি</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        ) : null}

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
