
import { GoogleGenAI } from "@google/genai";
import { ResultCategory, UserAnswer } from "../types";

const generatePrompt = (category: ResultCategory, answers: UserAnswer[]) => {
  const answersSummary = answers
    .map((ans) => `- ${ans.question}\n  - Your answer: ${ans.answer}`)
    .join("\n");

  return `
    You are a friendly and encouraging Financial Wellness Assistant.
    A user has just completed a financial health quiz.

    Their results are as follows:
    - Financial Health Category: ${category}
    - Their answers summary:
    ${answersSummary}

    Based on this information, generate a personalized financial health report. The report must be friendly, engaging, educational, and coach-like.

    The report MUST follow this structure exactly:

    ## 🌟 Your Financial Snapshot
    [Provide a 2-3 sentence summary of their financial habits based on their answers. Be positive and constructive, even if the category is "Needs Improvement".]

    ## 💡 3 Actionable Tips for You
    1. **[Tip 1 Title]:** [Detailed explanation of the first tip. Make it specific and actionable based on their answers.]
    2. **[Tip 2 Title]:** [Detailed explanation of the second tip.]
    3. **[Tip 3 Title]:** [Detailed explanation of the third tip.]

    ## 💪 Your Motivational Boost
    [Write a short, uplifting, and motivational message to encourage them on their financial journey.]

    Use emojis appropriately to make the report visually appealing and friendly. Do not include any other text or headings outside of this structure.
  `;
};

export const generateFinancialReport = async (
  category: ResultCategory,
  answers: UserAnswer[]
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API key not found");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = generatePrompt(category, answers);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error generating financial report:", error);
    return "We had trouble generating your personalized report. Please try again later. In the meantime, focus on building a small emergency fund and tracking your expenses. You can do it!";
  }
};
