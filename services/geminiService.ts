import { GoogleGenAI, Type } from "@google/genai";
import type { Answer, PreAssessmentData, BusinessPlan, BusinessPlanGoal } from '../types'; 
import { MAX_SCORE_PER_QUESTION, QUESTION_WEIGHTS_BY_BUSINESS_TYPE } from '../constants';

// Helper function to check for the API key
const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API কী পাওয়া যায়নি। অনুগ্রহ করে নিশ্চিত করুন যে আপনার এনভায়রনমেন্ট ভেরিয়েবলে API_KEY সেট করা আছে। (API key not found. Please ensure API_KEY is set in your environment variables.)");
  }
};

export const getRecommendations = async (
  weightedScore: number, 
  weightedMaxPossibleScore: number,
  percentageScore: number,
  answers: Answer[],
  preAssessmentData: PreAssessmentData
) => {
  checkApiKey(); // Check for API key first

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

    categoryScores[ans.category].currentWeighted += questionWeightedScore;
    categoryScores[ans.category].maxWeighted += questionMaxWeightedScore;
    categoryScores[ans.category].questions.push(`- প্রশ্ন: "${ans.text}", স্কোর: ${ans.score}/5`);
  });

  const strengths = Object.entries(categoryScores)
    .filter(([, data]) => (data.currentWeighted / data.maxWeighted) >= 0.7)
    .map(([category]) => category)
    .join(', ') || 'কোনোটিই নয়';

  const improvements = Object.entries(categoryScores)
    .filter(([, data]) => (data.currentWeighted / data.maxWeighted) < 0.6)
    .map(([category]) => category)
    .join(', ') || 'কোনোটিই নয়';

  const prompt = `
  Context: You are an expert business consultant for coastal micro-enterprises in Bangladesh.
  Your task is to provide personalized, actionable, and encouraging recommendations in BENGALI based on an environmental assessment.
  The user is a small business owner, so the language should be simple, clear, and supportive. Use markdown for formatting.

  Business Profile:
  - Business Name: ${preAssessmentData.businessName}
  - Business Type: ${preAssessmentData.businessType}
  - Location: ${preAssessmentData.location}
  - Employee Count: ${preAssessmentData.employeeCount}
  - Business Description: ${preAssessmentData.businessDescription || 'Not provided'}
  - Stated Goal/Challenge: ${preAssessmentData.mainChallengeOrGoal || 'Not provided'}

  Assessment Results:
  - Overall Green Score: ${percentageScore}/100
  - Total Weighted Score: ${weightedScore.toFixed(2)} out of ${weightedMaxPossibleScore.toFixed(2)}
  - Key Strengths (categories with scores >= 70%): ${strengths}
  - Top Areas for Improvement (categories with scores < 60%): ${improvements}

  Instructions:
  1.  **Start with an encouraging summary.** Acknowledge their effort in taking the assessment.
  2.  **Provide 3-5 key, actionable recommendations.** Focus on the "Top Areas for Improvement".
  3.  **For each recommendation, explain:**
      - **What to do:** A clear, simple action (e.g., "বর্জ্য আলাদা করা শুরু করুন").
      - **Why it's important:** The benefit for their business and the environment (e.g., "এতে আপনার খরচ কমবে এবং পরিবেশেরও উপকার হবে").
      - **How to start:** A very simple first step they can take (e.g., "দুটি ভিন্ন ঝুড়ি ব্যবহার করুন: একটি পচনশীল বর্জ্যের জন্য, অন্যটি প্লাস্টিক/কাগজের জন্য").
  4.  **Acknowledge their strengths.** Briefly mention what they are doing well.
  5.  **Keep it concise and easy to read.** Use bullet points (using '*') and bold text (using **text**).
  6.  **Maintain a positive and empowering tone.** The goal is to motivate, not criticize.
  7.  **All output must be in Bengali.**
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return { text: response.text };
};


// --- NEW Functions for Business Plan Co-Creator ---

export const generateInitialPlanParts = async (
  preAssessmentData: PreAssessmentData,
  percentageScore: number,
  initialRecommendations: string
): Promise<Pick<BusinessPlan, 'planTitle' | 'executiveSummary' | 'goals'>> => {
  checkApiKey(); // Check for API key first
    
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    As a business consultant for a micro-enterprise in coastal Bangladesh, create the initial sections of a "Green Growth Business Plan".
    The plan should be in BENGALI.

    Business Context:
    - Name: ${preAssessmentData.businessName}
    - Type: ${preAssessmentData.businessType}
    - Location: ${preAssessmentData.location}
    - Green Score: ${percentageScore}/100
    - Key AI Recommendations: ${initialRecommendations}
    - Stated Goal/Challenge: ${preAssessmentData.mainChallengeOrGoal || 'Focus on improving based on recommendations'}

    Instructions:
    1. Create a compelling "planTitle".
    2. Write a brief, optimistic "executiveSummary".
    3. Generate 2-3 specific, achievable "goals" based on the recommendations and business context. Each goal should have a "goalTitle" and a "description".

    Respond ONLY with a valid JSON object matching the provided schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          planTitle: { type: Type.STRING },
          executiveSummary: { type: Type.STRING },
          goals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                goalTitle: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["goalTitle", "description"],
            },
          },
        },
        required: ["planTitle", "executiveSummary", "goals"],
      },
    },
  });

  return JSON.parse(response.text) as Pick<BusinessPlan, 'planTitle' | 'executiveSummary' | 'goals'>;
};


export const generateRemainingPlanParts = async (
  preAssessmentData: PreAssessmentData,
  goals: BusinessPlanGoal[]
): Promise<Pick<BusinessPlan, 'actionSteps' | 'potentialPartners' | 'estimatedImpact'>> => {
  checkApiKey(); // Check for API key first

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const goalsString = goals.map(g => `- ${g.goalTitle}: ${g.description}`).join('\n');

  const prompt = `
    For the following business and its confirmed goals, generate the remaining sections of their "Green Growth Business Plan" in BENGALI.

    Business Context:
    - Name: ${preAssessmentData.businessName}
    - Type: ${preAssessmentData.businessType}
    - Location: ${preAssessmentData.location}

    Confirmed Goals:
    ${goalsString}

    Instructions:
    1. For each goal, create 2-3 concrete "actionSteps". Each step needs an "actionTitle", "details" on how to do it, and a realistic "timeline" (e.g., "১-৩ মাস", "৬ মাস").
    2. Suggest 2-3 "potentialPartners". For each, specify the "partnerType" (e.g., "স্থানীয় এনজিও", "সরকারি সংস্থা", "অন্যান্য ব্যবসা") and a "description" of how they can help.
    3. Write a concise "estimatedImpact" statement summarizing the expected positive outcomes (environmental, financial, social).

    Respond ONLY with a valid JSON object matching the provided schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          actionSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                actionTitle: { type: Type.STRING },
                details: { type: Type.STRING },
                timeline: { type: Type.STRING },
              },
              required: ["actionTitle", "details", "timeline"],
            },
          },
          potentialPartners: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                partnerType: { type: Type.STRING },
                description: { type: Type.STRING },
              },
               required: ["partnerType", "description"],
            },
          },
          estimatedImpact: { type: Type.STRING },
        },
        required: ["actionSteps", "potentialPartners", "estimatedImpact"],
      },
    },
  });

  return JSON.parse(response.text) as Pick<BusinessPlan, 'actionSteps' | 'potentialPartners' | 'estimatedImpact'>;
};