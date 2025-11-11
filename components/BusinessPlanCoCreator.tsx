import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { Chat } from "@google/genai";
import type { PreAssessmentData, BusinessPlan } from '../types';
import { generateInitialPlanParts, generateRemainingPlanParts } from '../services/geminiService';
import { GoalIcon, ActionIcon, PartnerIcon, ImpactIcon, SendIcon, AiIcon, UserIcon } from './BusinessPlanIcons';

interface BusinessPlanCoCreatorProps {
  preAssessmentData: PreAssessmentData;
  percentage: number;
  initialRecommendations: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

type GenerationStep = 'initial' | 'generatingGoals' | 'confirmGoals' | 'generatingActions' | 'complete';

const PlanSkeletonLoader: React.FC<{ message: string }> = ({ message }) => (
  <div className="animate-pulse space-y-6 p-6 text-center">
    <div className="h-6 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
    </div>
    <p className="text-s-teal-dark font-semibold mt-4">{message}</p>
    <div className="space-y-4 mt-6">
      <div className="h-10 bg-gray-200 rounded-md"></div>
      <div className="h-10 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);


export const BusinessPlanCoCreator: React.FC<BusinessPlanCoCreatorProps> = ({
  preAssessmentData,
  percentage,
  initialRecommendations,
}) => {
  const [businessPlan, setBusinessPlan] = useState<Partial<BusinessPlan> | null>(null);
  const [generationStep, setGenerationStep] = useState<GenerationStep>('initial');
  const [error, setError] = useState<string | null>(null);

  // State for the chat part
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleStartPlanGeneration = async (regenerate: boolean = false) => {
    setGenerationStep('generatingGoals');
    setError(null);
    if (!regenerate) {
        setBusinessPlan(null);
    }
    try {
      const initialParts = await generateInitialPlanParts(preAssessmentData, percentage, initialRecommendations);
      setBusinessPlan(initialParts);
      setGenerationStep('confirmGoals');
    } catch (err) {
      setError(err instanceof Error ? err.message : "একটি অজানা ত্রুটি ঘটেছে।");
      setGenerationStep('initial');
    }
  };

  const handleConfirmGoalsAndContinue = async () => {
    if (!businessPlan || !businessPlan.goals) return;
    setGenerationStep('generatingActions');
    setError(null);
    try {
      const remainingParts = await generateRemainingPlanParts(preAssessmentData, businessPlan.goals);
      const fullPlan: BusinessPlan = {
          ...businessPlan,
          actionSteps: remainingParts.actionSteps,
          potentialPartners: remainingParts.potentialPartners,
          estimatedImpact: remainingParts.estimatedImpact,
      } as BusinessPlan;
      setBusinessPlan(fullPlan);
      setGenerationStep('complete');
      initializeChat(fullPlan);
    } catch (err) {
       setError(err instanceof Error ? err.message : "একটি অজানা ত্রুটি ঘটেছে।");
       setGenerationStep('confirmGoals'); // Go back to confirmation step on error
    }
  };
  
  const initializeChat = (plan: BusinessPlan) => {
    const apiKey = "AIzaSyBLfNk0Og7RO-Fxl_fuPJJYz7IgNgOWT94";
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `You are a helpful assistant for a small business owner in coastal Bangladesh. Your goal is to refine their "Green Growth Business Plan". The user will provide their current plan as a JSON object and a modification request in Bengali. You MUST respond with ONLY the full, updated business plan in the exact same JSON format. Do not add any introductory text, explanations, or markdown formatting around the JSON. Your output must be a pure, valid JSON object that can be parsed directly.`;
    
    chatSessionRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    setChatHistory([{ sender: 'ai', text: `আপনার "${plan.planTitle}" পরিকল্পনার খসড়া তৈরি। আপনি কীভাবে এটি পরিবর্তন করতে চান তা আমাকে বলুন।` }]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isUpdating || !chatSessionRef.current || !businessPlan) return;

    const userMessage: ChatMessage = { sender: 'user', text: userInput };
    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsUpdating(true);
    setError(null);

    try {
      const prompt = `CURRENT_PLAN_JSON_START ${JSON.stringify(businessPlan)} CURRENT_PLAN_JSON_END\n\nUSER_REQUEST: "${userMessage.text}"`;
      const response = await chatSessionRef.current.sendMessage({ message: prompt });
      
      const responseText = response.text.trim();
      const newPlan = JSON.parse(responseText) as BusinessPlan;
      
      setBusinessPlan(newPlan);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'আপনার পরিকল্পনা আপডেট করা হয়েছে। আর কিছু পরিবর্তন করতে চান?' }]);

    } catch (err) {
      const errorMsg = "দুঃখিত, আমি আপনার অনুরোধটি প্রক্রিয়া করতে পারিনি। অনুগ্রহ করে আবার চেষ্টা করুন।";
      setError(errorMsg);
      setChatHistory(prev => [...prev, { sender: 'ai', text: errorMsg }]);
      console.error("Chat update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderContent = () => {
    switch (generationStep) {
      case 'initial':
        return (
          <div className="bg-bg-offset p-8 rounded-xl shadow-soft text-center border-t-4 border-p-green">
            <h3 className="text-2xl font-bold text-text-primary mb-3">পরবর্তী পদক্ষেপ: আপনার পরিকল্পনা তৈরি করুন</h3>
            <p className="text-text-secondary mb-6 max-w-2xl mx-auto">আপনার মূল্যায়ন ফলাফলকে একটি কার্যকরী "সবুজ প্রবৃদ্ধি পরিকল্পনা"-তে রূপান্তর করুন। জেমিনি এআই আপনাকে ধাপে ধাপে একটি খসড়া তৈরি করতে সাহায্য করবে।</p>
            <button
              onClick={() => handleStartPlanGeneration(false)}
              className="bg-p-green hover:bg-p-green-dark text-white font-semibold py-3 px-8 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-p-green-dark focus:ring-opacity-60"
            >
              আমার পরিকল্পনা তৈরি শুরু করুন
            </button>
             {error && <p className="text-red-600 mt-4">{error}</p>}
          </div>
        );

      case 'generatingGoals':
        return (
          <div className="bg-bg-offset p-8 rounded-xl shadow-soft border-t-4 border-p-green">
            <PlanSkeletonLoader message="আপনার ব্যবসার জন্য প্রধান লক্ষ্যগুলি চিহ্নিত করা হচ্ছে..." />
          </div>
        );
      
      case 'confirmGoals':
        return (
            <div className="bg-bg-offset p-8 rounded-xl shadow-soft border-t-4 border-p-green text-center">
                <h2 className="text-2xl font-bold text-text-primary mb-2">{businessPlan?.planTitle}</h2>
                <p className="text-sm text-text-secondary italic mb-6">{businessPlan?.executiveSummary}</p>
                
                <div className="text-left mb-8">
                    <h3 className="font-semibold text-lg text-s-teal-dark mb-3 flex items-center justify-center"><GoalIcon /> প্রস্তাবিত লক্ষ্যসমূহ</h3>
                    <ul className="list-none space-y-3 max-w-lg mx-auto">
                        {businessPlan?.goals?.map((goal, i) => (
                        <li key={i} className="border-l-2 border-s-teal-light pl-4 p-2 bg-bg-main rounded-r-lg">
                            <strong className="font-semibold text-text-primary">{goal.goalTitle}</strong>
                            <p className="text-sm text-text-secondary">{goal.description}</p>
                        </li>
                        ))}
                    </ul>
                </div>
                
                <p className="text-text-secondary mb-4">এই লক্ষ্যগুলো কি আপনার ব্যবসার জন্য উপযুক্ত?</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleConfirmGoalsAndContinue}
                        className="bg-p-green hover:bg-p-green-dark text-white font-semibold py-2 px-6 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        হ্যাঁ, পরবর্তী ধাপে যান
                    </button>
                    <button
                        onClick={() => handleStartPlanGeneration(true)}
                        className="bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-2 px-6 rounded-lg shadow-interactive hover:shadow-interactive-hover transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                        অন্যান্য লক্ষ্যের পরামর্শ দিন
                    </button>
                </div>
                 {error && <p className="text-red-600 mt-4">{error}</p>}
            </div>
        );
      
      case 'generatingActions':
         return (
          <div className="bg-bg-offset p-8 rounded-xl shadow-soft border-t-4 border-p-green">
            <PlanSkeletonLoader message="আপনার লক্ষ্য অর্জনের জন্য কর্মপরিকল্পনা তৈরি করা হচ্ছে..." />
          </div>
        );

      case 'complete':
        return (
          <div className="bg-bg-offset rounded-xl shadow-soft-lg border-t-4 border-p-green-dark overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Panel: The Plan */}
              <div className="p-6 sm:p-8 relative">
                {isUpdating && <div className="absolute inset-0 bg-white/70 z-10 backdrop-blur-sm"></div>}
                <h2 className="text-2xl font-bold text-text-primary mb-2">{businessPlan?.planTitle}</h2>
                <p className="text-sm text-text-secondary italic mb-6">{businessPlan?.executiveSummary}</p>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg text-s-teal-dark mb-3 flex items-center"><GoalIcon /> লক্ষ্য</h3>
                    <ul className="list-none space-y-3 pl-8">
                      {businessPlan?.goals?.map((goal, i) => (
                        <li key={i} className="border-l-2 border-s-teal-light pl-4"><strong className="font-semibold text-text-primary">{goal.goalTitle}</strong><p className="text-sm text-text-secondary">{goal.description}</p></li>
                      ))}
                    </ul>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg text-s-teal-dark mb-3 flex items-center"><ActionIcon /> কর্ম পরিকল্পনা</h3>
                    <ul className="list-none space-y-3 pl-8">
                      {businessPlan?.actionSteps?.map((step, i) => (
                        <li key={i} className="border-l-2 border-s-teal-light pl-4"><strong className="font-semibold text-text-primary">{step.actionTitle}</strong><p className="text-sm text-text-secondary">{step.details}</p><p className="text-xs font-medium text-p-green-dark bg-p-green-light/50 px-2 py-0.5 rounded-full inline-block mt-1">সময়সীমা: {step.timeline}</p></li>
                      ))}
                    </ul>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg text-s-teal-dark mb-3 flex items-center"><PartnerIcon /> সম্ভাব্য অংশীদার</h3>
                    <ul className="list-none space-y-3 pl-8">
                      {businessPlan?.potentialPartners?.map((p, i) => (
                        <li key={i} className="border-l-2 border-s-teal-light pl-4"><strong className="font-semibold text-text-primary">{p.partnerType}</strong><p className="text-sm text-text-secondary">{p.description}</p></li>
                      ))}
                    </ul>
                  </div>
                   <div>
                    <h3 className="font-semibold text-lg text-s-teal-dark mb-3 flex items-center"><ImpactIcon /> আনুমানিক প্রভাব</h3>
                    <p className="text-sm text-text-secondary pl-8">{businessPlan?.estimatedImpact}</p>
                  </div>
                </div>
              </div>
              {/* Right Panel: Chat Assistant */}
              <div className="bg-bg-main flex flex-col h-[450px] md:h-[550px] lg:h-auto">
                 <div className="p-4 border-b border-border-color"><h3 className="font-semibold text-lg text-text-primary text-center">AI সহকারী</h3></div>
                 <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                      {chatHistory.map((msg, i) => (
                          <div key={i} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-s-teal text-white flex items-center justify-center flex-shrink-0"><AiIcon className="w-5 h-5" /></div>}
                              <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2.5 ${msg.sender === 'user' ? 'bg-p-green text-white rounded-br-none' : 'bg-white shadow-soft text-text-primary rounded-bl-none'}`}><p className="text-sm">{msg.text}</p></div>
                               {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-accent-gold text-white flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5"/></div>}
                          </div>
                      ))}
                      {isUpdating && <div className="flex justify-start gap-3"><div className="w-8 h-8 rounded-full bg-s-teal text-white flex items-center justify-center flex-shrink-0"><AiIcon className="w-5 h-5" /></div><div className="rounded-lg px-4 py-2.5 bg-white shadow-soft"><span className="animate-pulse">...</span></div></div>}
                 </div>
                 {error && <p className="px-4 pb-2 text-xs text-red-600">{error}</p>}
                 <form onSubmit={handleChatSubmit} className="p-4 border-t border-border-color bg-white">
                      <div className="relative">
                          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="আপনার অনুরোধ টাইপ করুন..." disabled={isUpdating} className="w-full pr-12 pl-4 py-3 border border-border-color rounded-full focus:ring-2 focus:ring-s-teal focus:outline-none transition-shadow text-sm"/>
                          <button type="submit" disabled={isUpdating || !userInput.trim()} className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full text-s-teal-dark hover:text-p-green disabled:text-gray-400 transition-colors"><SendIcon className="w-6 h-6" /></button>
                      </div>
                 </form>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};