import { GoogleGenAI, Type } from "@google/genai";
import type { Answer, PreAssessmentData, BusinessPlan, BusinessPlanGoal } from '../types'; 
import { MAX_SCORE_PER_QUESTION, QUESTION_WEIGHTS_BY_BUSINESS_TYPE } from '../constants';

const checkApiKey = () => {
  if (!process.env.API_KEY) {
    throw new Error("API কী পাওয়া যায়নি। অনুগ্রহ করে নিশ্চিত করুন যে আপনার এনভায়রনমেন্ট ভেরিয়েবলে API_KEY সেট করা আছে।");
  }
};

export const getRecommendations = async (
  weightedScore: number, 
  weightedMaxPossibleScore: number,
  percentageScore: number,
  answers: Answer[],
  preAssessmentData: PreAssessmentData
): Promise<{ text: string }> => {
  checkApiKey();
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
    categoryScores[ans.category].questions.push(`প্রশ্ন: ${ans.text} (উত্তর স্কোর: ${ans.score}/5, ওজন: ${weight.toFixed(2)})`);
  });

  const categorySummary = Object.entries(categoryScores).map(([category, data]) => {
    const percentage = data.maxWeighted > 0 ? (data.currentWeighted / data.maxWeighted) * 100 : 0;
    return `${category}: ${percentage.toFixed(0)}% স্কোর ( প্রশ্নসমূহ: ${data.questions.join('; ')} )`;
  }).join('\n');

  const systemInstruction = `You are an expert consultant for small, eco-friendly businesses in coastal Bangladesh. Your task is to provide practical, actionable recommendations in BENGALI based on an assessment.

  The user is a small business owner. The language must be simple, encouraging, and easy to understand.
  
  Structure your response like this:
  1.  Start with a brief, positive, and encouraging opening paragraph acknowledging their score and effort.
  2.  Create a section titled "**আপনার প্রধান শক্তি**" and list 2-3 key strengths based on high-scoring categories.
  3.  Create a section titled "**উন্নতির সেরা সুযোগ**" and provide 3-5 clear, actionable, and prioritized recommendations. Focus on the lowest-scoring categories.
  4.  For each recommendation, provide:
      - A clear title using double asterisks (e.g., **১. বর্জ্য ব্যবস্থাপনার উন্নতি**).
      - A simple one-sentence explanation of "কেন এটি গুরুত্বপূর্ণ?".
      - 2-3 bullet points under "আপনি যা করতে পারেন:" with specific, low-cost, practical steps.
  5.  End with a short, motivational closing paragraph.
  
  Keep the tone supportive. The recommendations must be relevant to the business type and context provided.`;
  
  const prompt = `
    **ব্যবসার তথ্য:**
    - ব্যবসার নাম: ${preAssessmentData.businessName}
    - ব্যবসার ধরণ: ${preAssessmentData.businessType}
    - অবস্থান: ${preAssessmentData.location}
    - কর্মী সংখ্যা: ${preAssessmentData.employeeCount}
    - ব্যবসার বিবরণ: ${preAssessmentData.businessDescription || 'দেওয়া হয়নি'}
    - প্রধান চ্যালেঞ্জ/লক্ষ্য: ${preAssessmentData.mainChallengeOrGoal || 'দেওয়া হয়নি'}

    **মূল্যায়ন ফলাফল:**
    - সামগ্রিক স্কোর: ${percentageScore}/100 (মোট ভারযুক্ত স্কোর: ${weightedScore.toFixed(2)}/${weightedMaxPossibleScore.toFixed(2)})
    
    **বিভাগভিত্তিক স্কোরের সারাংশ:**
    ${categorySummary}

    Based on this data, provide recommendations in Bengali following the specified structure and tone.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.5,
      topP: 0.95,
      topK: 40,
    },
  });

  return { text: response.text };
};


// Schema for the initial parts of the business plan
const initialPlanSchema = {
    type: Type.OBJECT,
    properties: {
        planTitle: { type: Type.STRING, description: "A creative and inspiring title for the business plan in Bengali." },
        executiveSummary: { type: Type.STRING, description: "A brief, encouraging one-paragraph summary in Bengali." },
        goals: {
            type: Type.ARRAY,
            description: "An array of 2-3 main high-level goals for the business in Bengali.",
            items: {
                type: Type.OBJECT,
                properties: {
                    goalTitle: { type: Type.STRING, description: "A short, clear title for the goal in Bengali." },
                    description: { type: Type.STRING, description: "A one-sentence description of the goal in Bengali." }
                },
                required: ["goalTitle", "description"]
            }
        }
    },
    required: ["planTitle", "executiveSummary", "goals"]
};


export const generateInitialPlanParts = async (
  preAssessmentData: PreAssessmentData,
  percentage: number,
  initialRecommendations: string
): Promise<Partial<BusinessPlan>> => {
  checkApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate the initial parts of a "Green Growth Business Plan" in Bengali for a small business in coastal Bangladesh.
    
    Business Data:
    - Type: ${preAssessmentData.businessType}
    - Name: ${preAssessmentData.businessName}
    - Location: ${preAssessmentData.location}
    - Goal/Challenge: ${preAssessmentData.mainChallengeOrGoal}
    - Green Score: ${percentage}/100
    - Key Recommendations: ${initialRecommendations}

    Based on this, create:
    1.  'planTitle': A creative title like "${preAssessmentData.businessName}-এর সবুজ যাত্রা".
    2.  'executiveSummary': A short, inspiring summary.
    3.  'goals': An array of 2-3 primary, actionable goals derived from the recommendations and business context. Each goal should have a 'goalTitle' and a 'description'.
    
    The output must be a pure JSON object matching the provided schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: initialPlanSchema,
    },
  });

  return JSON.parse(response.text) as Partial<BusinessPlan>;
};


const remainingPlanSchema = {
    type: Type.OBJECT,
    properties: {
        actionSteps: {
            type: Type.ARRAY,
            description: "3-4 specific, practical action steps to achieve the goals.",
            items: {
                type: Type.OBJECT,
                properties: {
                    actionTitle: { type: Type.STRING },
                    details: { type: Type.STRING, description: "A one-sentence detail of the action in Bengali." },
                    timeline: { type: Type.STRING, description: "A simple timeline like '৩ মাস' or '৬ মাস'." }
                },
                required: ["actionTitle", "details", "timeline"]
            }
        },
        potentialPartners: {
            type: Type.ARRAY,
            description: "2-3 potential partners, local or governmental.",
            items: {
                type: Type.OBJECT,
                properties: {
                    partnerType: { type: Type.STRING, description: "e.g., 'স্থানীয় এনজিও', 'সরকারি কৃষি অফিস'." },
                    description: { type: Type.STRING, description: "How they can help, in one sentence in Bengali." }
                },
                required: ["partnerType", "description"]
            }
        },
        estimatedImpact: { type: Type.STRING, description: "A one-sentence summary of the potential positive impact in Bengali." }
    },
    required: ["actionSteps", "potentialPartners", "estimatedImpact"]
};


export const generateRemainingPlanParts = async (
  preAssessmentData: PreAssessmentData,
  goals: BusinessPlanGoal[]
): Promise<Partial<BusinessPlan>> => {
    checkApiKey();
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      For a small "${preAssessmentData.businessType}" in coastal Bangladesh, and based on these primary goals:
      ${goals.map(g => `- ${g.goalTitle}: ${g.description}`).join('\n')}
      
      Generate the remaining parts of their business plan in Bengali:
      1. 'actionSteps': 3-4 practical, low-cost steps to achieve these goals.
      2. 'potentialPartners': 2-3 relevant local partners (like NGOs, government offices, local markets).
      3. 'estimatedImpact': A single sentence on the potential positive outcome.

      The output must be a pure JSON object matching the provided schema.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: remainingPlanSchema,
      },
    });

    return JSON.parse(response.text) as Partial<BusinessPlan>;
};
