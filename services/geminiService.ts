
import { GoogleGenAI, Type } from "@google/genai";
import type { Answer, PreAssessmentData, BusinessPlan } from '../types'; 
import { MAX_SCORE_PER_QUESTION, QUESTION_WEIGHTS_BY_BUSINESS_TYPE } from '../constants';

export const getRecommendations = async (
  weightedScore: number, 
  weightedMaxPossibleScore: number,
  percentageScore: number,
  answers: Answer[],
  preAssessmentData: PreAssessmentData
) => {
  const apiKey = "AIzaSyBLfNk0Og7RO-Fxl_fuPJJYz7IgNgOWT94";

  if (!preAssessmentData) {
    throw new Error("ব্যবসার প্রেক্ষাপট তথ্য (preAssessmentData) অনুপস্থিত।");
  }

  const ai = new GoogleGenAI({ apiKey });

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
    
    if (questionWeightedScore < questionMaxWeightedScore / 2 || ans.score <=2 ) { // Consider raw score for specific low answers too
        categoryScores[ans.category].questions.push(`- "${ans.text}" (স্কোর ${ans.score}/${MAX_SCORE_PER_QUESTION}, গুরুত্ব অনুসারে স্কোর ${questionWeightedScore.toFixed(2)}/${questionMaxWeightedScore.toFixed(2)})`);
    }
  });
  
  let improvementAreasSummary = "ব্যবসাটি সামগ্রিকভাবে ভাল পারফর্ম করেছে।";
  const lowScoringCategories = Object.entries(categoryScores)
    .filter(([_, data]) => (data.maxWeighted > 0 ? (data.currentWeighted / data.maxWeighted) : 0) < 0.6) // 60% threshold
    .map(([category, data]) => {
        let summary = `${category} বিভাগে (গুরুত্ব অনুসারে স্কোর ${data.currentWeighted.toFixed(2)}/${data.maxWeighted.toFixed(2)}):\n`;
        if(data.questions.length > 0){
            summary += `  মনোযোগের জন্য নির্দিষ্ট বিষয় (সবচেয়ে কম স্কোর করা প্রশ্নগুলির মধ্যে কয়েকটি):\n${data.questions.slice(0,2).join('\n')}`; 
        } else {
            summary += `  আরও উন্নতির জন্য এই ক্ষেত্রে সামগ্রিক অনুশীলনগুলি পর্যালোচনা করার কথা বিবেচনা করুন।`
        }
        return summary;
    });

  if (lowScoringCategories.length > 0) {
    improvementAreasSummary = `স্ব-মূল্যায়ন অনুসারে উন্নতির জন্য চিহ্নিত প্রধান ক্ষেত্রগুলি:\n${lowScoringCategories.join('\n\n')}`;
  }

  let businessContext = `ব্যবসার নাম: ${preAssessmentData.businessName}\nব্যবসার ধরণ: ${preAssessmentData.businessType}\nঅবস্থান: ${preAssessmentData.location}\nকর্মী সংখ্যা: ${preAssessmentData.employeeCount}`;

  if (preAssessmentData.businessDescription && preAssessmentData.businessDescription.trim() !== "") {
    businessContext += `\nব্যবসার সংক্ষিপ্ত বিবরণ: ${preAssessmentData.businessDescription}`;
  }

  if (preAssessmentData.mainChallengeOrGoal && preAssessmentData.mainChallengeOrGoal.trim() !== "") {
    businessContext += `\nব্যবসার দ্বারা উল্লিখিত প্রধান চ্যালেঞ্জ বা লক্ষ্য: ${preAssessmentData.mainChallengeOrGoal}`;
  } else {
    businessContext += `\nব্যবসার দ্বারা কোনো নির্দিষ্ট প্রধান চ্যালেঞ্জ বা লক্ষ্য উল্লেখ করা হয়নি।`;
  }


  const prompt = `
আপনি সবুজ ব্যবসায়িক অনুশীলনের জন্য একজন বিশেষজ্ঞ উপদেষ্টা, বিশেষত বাংলাদেশের উপকূলীয় অঞ্চলের কুটির ও মাইক্রো-উদ্যোগগুলিকে সহায়তা করার ক্ষেত্রে বিশেষজ্ঞ।
একটি ব্যবসা এইমাত্র তার পরিবেশগত অনুশীলনগুলির একটি স্ব-মূল্যায়ন সম্পন্ন করেছে। প্রতিটি প্রশ্নের উত্তর ১ থেকে ৫ এর মধ্যে স্কোর করা হয়েছে, যেখানে ১ সর্বনিম্ন এবং ৫ সর্বোচ্চ। এই স্কোরগুলিকে ব্যবসার ধরণের উপর ভিত্তি করে নির্দিষ্ট গুরুত্ব (weight) দিয়ে গুণ করা হয়েছে।

ব্যবসার প্রেক্ষাপট:
${businessContext}

তাদের সামগ্রিক সবুজ স্কোর হলো ১০০ এর মধ্যে ${percentageScore} (যা গুরুত্ব অনুসারে গণনা করা হয়েছে, প্রকৃত স্কোর ${weightedMaxPossibleScore.toFixed(2)} এর মধ্যে ${weightedScore.toFixed(2)})।

${improvementAreasSummary}

এর উপর ভিত্তি করে, এই ব্যবসাকে (${preAssessmentData.businessType} প্রকৃতির, ${preAssessmentData.location} এ অবস্থিত, কর্মী সংখ্যা ${preAssessmentData.employeeCount}) তার পরিবেশগত কর্মক্ষমতা উন্নত করতে সাহায্য করার জন্য ৩-৫টি বাস্তবসম্মত, কার্যকরী এবং স্বল্প খরচের সুপারিশ দিন।

গুরুত্বপূর্ণ বিবেচনা:
1.  যদি ব্যবসার কোনো "সংক্ষিপ্ত বিবরণ" প্রদান করা হয়ে থাকে, তবে সেই বিবরণটি সুপারিশগুলিকে প্রাসঙ্গিক করতে ব্যবহার করুন।
2.  যদি ব্যবসা কোনো "প্রধান চ্যালেঞ্জ বা লক্ষ্য" উল্লেখ করে থাকে, তবে আপনার সুপারিশগুলির মধ্যে অন্তত একটি যেন সরাসরি সেই চ্যালেঞ্জ বা লক্ষ্যের সাথে সম্পর্কিত হয়।
3.  প্রদত্ত "কর্মী সংখ্যা" (${preAssessmentData.employeeCount}) বিবেচনা করে সুপারিশগুলির পরিধি এবং বিনিয়োগের প্রয়োজনীয়তা সামঞ্জস্যপূর্ণ করুন (যেমন, কম কর্মী সংখ্যার ব্যবসার জন্য সহজ এবং কম খরচের সমাধান)।
4.  তাদের ছোট আকারের এবং উপকূলীয় প্রেক্ষাপটের সাথে প্রাসঙ্গিক সমাধানগুলিতে মনোযোগ দিন (যেমন, লবণাক্ততা, ঘূর্ণিঝড়, সীমিত সম্পদ, স্থানীয় স্থিতিস্থাপকতা বৃদ্ধি, এবং প্রদত্ত ব্যবসার ধরনের সাথে সম্পর্কিত নির্দিষ্ট চ্যালেঞ্জ)।
5.  স্ব-মূল্যায়নের "উন্নতির জন্য চিহ্নিত প্রধান ক্ষেত্রগুলি" বিবেচনা করুন, তবে শুধুমাত্র সেগুলির মধ্যে সীমাবদ্ধ থাকবেন না, বিশেষ করে যদি ব্যবহারকারীর দ্বারা উল্লিখিত প্রধান চ্যালেঞ্জ বা লক্ষ্য থাকে।

সুপারিশগুলি বন্ধুত্বপূর্ণ এবং উৎসাহব্যঞ্জক সুরে স্পষ্টভাবে উপস্থাপন করুন। ভাষা যেন স্থানীয় উদ্যোক্তাদের জন্য সহজ এবং সহজে বোধগম্য হয় তা নিশ্চিত করুন।

আপনার প্রতিক্রিয়া একটি সংক্ষিপ্ত ইতিবাচক ভূমিকা, তারপর সুপারিশ এবং একটি সংক্ষিপ্ত উৎসাহব্যঞ্জক সমাপ্তি দিয়ে গঠন করুন। সুপারিশগুলি নিম্নলিখিত বিন্যাসে প্রদান করুন:
- প্রধান সুপারিশগুলির জন্য একটি **সংখ্যায়িত তালিকা** ব্যবহার করুন (যেমন: ১., ২., ৩.)।
- প্রতিটি প্রধান সুপারিশের অধীনে, প্রয়োজনে আরও বিস্তারিত বা উপ-ধাপগুলির জন্য **'*' দিয়ে শুরু করে বুলেটযুক্ত উপ-আইটেম** ব্যবহার করতে পারেন।
- গুরুত্বপূর্ণ শব্দ বা প্রধান ধারণাগুলিকে **\`**জোরালো**\`** (bold) করতে ডাবল অ্যাস্টেরিস্ক (\`**\`) ব্যবহার করুন।
- উদাহরণ, বা অতিরিক্ত জোর দেওয়ার জন্য **\`*বাঁকা অক্ষরে লেখা*\`** (italic) করতে একক অ্যাস্টেরিস্ক (\`*\`) ব্যবহার করুন।
আপনার প্রতিক্রিয়াতে স্কোর বা উন্নতির ক্ষেত্রগুলির পুনরাবৃত্তি করবেন না, কার্যকরী পরামর্শের উপর মনোযোগ দিন। সুপারিশগুলি যেন সাধারণ পরামর্শের পরিবর্তে সুনির্দিষ্ট হয় এবং প্রদত্ত ব্যবসার ধরণ, বিবরণ, অবস্থান, কর্মী সংখ্যা এবং উল্লিখিত লক্ষ্যের জন্য যথাসম্ভব প্রাসঙ্গিক হয়।
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
       config: {
        temperature: 0.75, 
        topP: 0.95,
        topK: 40,
      }
    });
    
    return response;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
        throw new Error(`জেমিনি এপিআই অনুরোধ ব্যর্থ হয়েছে: ${error.message}`);
    }
    throw new Error('জেমিনি এপিআই থেকে সুপারিশ আনার সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।');
  }
};


// --- NEW: Function to generate the Business Plan ---
export const generateBusinessPlan = async (
  preAssessmentData: PreAssessmentData,
  percentageScore: number,
  initialRecommendations: string
): Promise<BusinessPlan> => {
  const apiKey = "AIzaSyBLfNk0Og7RO-Fxl_fuPJJYz7IgNgOWT94";
  const ai = new GoogleGenAI({ apiKey });

  const businessContext = `
    - ব্যবসার নাম: ${preAssessmentData.businessName}
    - ব্যবসার ধরণ: ${preAssessmentData.businessType}
    - অবস্থান: ${preAssessmentData.location}
    - কর্মী সংখ্যা: ${preAssessmentData.employeeCount}
    - ব্যবসার বিবরণ: ${preAssessmentData.businessDescription || 'প্রদান করা হয়নি'}
    - প্রধান চ্যালেঞ্জ/লক্ষ্য: ${preAssessmentData.mainChallengeOrGoal || 'প্রদান করা হয়নি'}
  `;

  const prompt = `
  আপনি বাংলাদেশের উপকূলীয় অঞ্চলের ক্ষুদ্র ব্যবসার জন্য একজন সবুজ প্রবৃদ্ধি কৌশলবিদ। আপনার কাজ হলো একটি ব্যবসাকে তার পরিবেশগত মূল্যায়ন ফলাফলের উপর ভিত্তি করে একটি সহজ, কার্যকরী, এক-পৃষ্ঠার "সবুজ প্রবৃদ্ধি পরিকল্পনা" তৈরি করতে সহায়তা করা।

  ব্যবসার প্রেক্ষাপট:
  ${businessContext}

  ব্যবসাটি ১০০ এর মধ্যে ${percentageScore} স্কোর করেছে এবং তাদের জন্য নিম্নলিখিত প্রাথমিক সুপারিশগুলি তৈরি করা হয়েছে:
  ${initialRecommendations}

  আপনার কাজ: উপরের তথ্য ব্যবহার করে, একটি JSON অবজেক্ট তৈরি করুন যা একটি "সবুজ প্রবৃদ্ধি পরিকল্পনা"-কে প্রতিনিধিত্ব করে। পরিকল্পনাটি অবশ্যই বাস্তবসম্মত, অনুপ্রেরণামূলক এবং ব্যবসার নির্দিষ্ট প্রেক্ষাপটের সাথে প্রাসঙ্গিক হতে হবে।

  নির্দেশনা:
  1.  **planTitle**: একটি অনুপ্রেরণামূলক শিরোনাম তৈরি করুন, যেমন "${preAssessmentData.businessName}-এর টেকসই ভবিষ্যতের রূপরেখা"।
  2.  **executiveSummary**: ২-৩ বাক্যে একটি সারসংক্ষেপ লিখুন যা ব্যবসার বর্তমান অবস্থা এবং এই পরিকল্পনার উদ্দেশ্য বর্ণনা করে।
  3.  **goals**: ২-৩টি সুস্পষ্ট, অর্জনযোগ্য সবুজ লক্ষ্য চিহ্নিত করুন। প্রতিটি লক্ষ্যের একটি 'goalTitle' এবং একটি সংক্ষিপ্ত 'description' থাকবে।
  4.  **actionSteps**: ৩-৪টি বাস্তবসম্মত কর্মপরিকল্পনা তৈরি করুন। প্রতিটি কর্মপরিকল্পনার একটি 'actionTitle', কিছু 'details' এবং একটি বাস্তবসম্মত 'timeline' (যেমন: "১-৩ মাস", "৬ মাস") থাকবে। এগুলি প্রাথমিক সুপারিশ এবং ব্যবসার চ্যালেঞ্জ থেকে অনুপ্রাণিত হওয়া উচিত।
  5.  **potentialPartners**: ১-২টি সম্ভাব্য অংশীদার বা সহায়তাকারী গোষ্ঠীর প্রকার উল্লেখ করুন। প্রতিটি সঙ্গীর একটি 'partnerType' (যেমন: "স্থানীয় এনজিও", "সরকারি কৃষি অফিস") এবং তারা কীভাবে সহায়তা করতে পারে তার একটি 'description' থাকবে।
  6.  **estimatedImpact**: ১-২ বাক্যে বর্ণনা করুন যে এই পরিকল্পনা বাস্তবায়ন করা হলে ব্যবসার উপর কী ইতিবাচক পরিবেশগত এবং আর্থিক প্রভাব পড়তে পারে।

  ভাষা অবশ্যই সহজ, সরল এবং একজন স্থানীয় উদ্যোক্তার জন্য বোধগম্য হতে হবে। শুধুমাত্র অনুরোধ করা JSON অবজেক্টটি প্রদান করুন, অন্য কোনো অতিরিক্ত টেক্সট বা ব্যাখ্যা ছাড়াই।
  `;

  const businessPlanSchema = {
    type: Type.OBJECT,
    properties: {
      planTitle: { type: Type.STRING, description: "পরিকল্পনার শিরোনাম।" },
      executiveSummary: { type: Type.STRING, description: "পরিকল্পনার সারসংক্ষেপ।" },
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
      estimatedImpact: { type: Type.STRING, description: "পরিকল্পনার আনুমানিক প্রভাব।" },
    },
    required: ["planTitle", "executiveSummary", "goals", "actionSteps", "potentialPartners", "estimatedImpact"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
        responseMimeType: "application/json",
        responseSchema: businessPlanSchema,
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as BusinessPlan;

  } catch (error) {
    console.error('Error calling Gemini API for Business Plan:', error);
    if (error instanceof Error) {
      throw new Error(`জেমিনি এপিআই থেকে ব্যবসায়িক পরিকল্পনা তৈরি করতে ব্যর্থ হয়েছে: ${error.message}`);
    }
    throw new Error('ব্যবসায়িক পরিকল্পনা তৈরির সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।');
  }
};
