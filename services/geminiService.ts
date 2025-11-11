import { GoogleGenAI, Type } from "@google/genai";
import type { Answer, PreAssessmentData, BusinessPlan, BusinessPlanGoal } from '../types'; 
import { MAX_SCORE_PER_QUESTION, QUESTION_WEIGHTS_BY_BUSINESS_TYPE } from '../constants';

export const getRecommendations = async (
  weightedScore: number, 
  weightedMaxPossibleScore: number,
  percentageScore: number,
  answers: Answer[],
  preAssessmentData: PreAssessmentData
) => {
  if (!preAssessmentData) {
    throw new Error("ব্যবসার প্রেক্ষাপট তথ্য (preAssessmentData) অনুপস্থিত।");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const categoryScores: Record<string, { currentWeighted: number; maxWeighted: number; questions: string[] }> = {};
  
  answers.forEach(ans => {
    if (!categoryScores[ans.category]) {
      categoryScores[ans.category] = { currentWeighted: 0, maxWeighted: 0, questions: [] };
    }
    const businessTypeWeights = QUESTION_WEIGHTS_BY_BUSINESS_TYPE[preAssessmentData.businessType];
    const weight = businessTypeWeights?.[ans.questionId] ?? 1.0;
    
    const questionWeightedScore = ans.score * weight;
    const questionMaxWeightedScore = MAX_SCORE_PER_QUESTION * weight;

