import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysis, ThaliAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeFoodImage(base64Image: string): Promise<FoodAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this Indian food image. Provide the following details in JSON format:
            - foodName: Name of the dish (e.g., Masala Dosa, Biryani)
            - calories: Estimated calories in kcal (number)
            - carbohydrates: "High", "Medium", or "Low"
            - protein: "High", "Medium", or "Low"
            - fat: "High", "Medium", or "Low"
            - fiber: "High", "Medium", or "Low"
            - oilLevel: "High", "Medium", or "Low"
            - sugarLevel: "High", "Medium", or "Low"
            - sodiumLevel: "High", "Medium", or "Low"
            - healthScore: 1 to 10 (number)
            - isStreetFood: boolean
            - suggestions: 3 healthier Indian alternatives (array of strings)
            - balanceScore: 1 to 10 (number)
            - balanceFeedback: Brief feedback on meal balance (string)
            
            If the food is unknown, provide the closest matching Indian dish category.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING },
          calories: { type: Type.NUMBER },
          carbohydrates: { type: Type.STRING },
          protein: { type: Type.STRING },
          fat: { type: Type.STRING },
          fiber: { type: Type.STRING },
          oilLevel: { type: Type.STRING },
          sugarLevel: { type: Type.STRING },
          sodiumLevel: { type: Type.STRING },
          healthScore: { type: Type.NUMBER },
          isStreetFood: { type: Type.BOOLEAN },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          balanceScore: { type: Type.NUMBER },
          balanceFeedback: { type: Type.STRING },
        },
        required: ["foodName", "calories", "healthScore"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function analyzeThaliImage(base64Image: string): Promise<ThaliAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `Analyze this Indian Thali image. Detect all items on the plate and provide the total nutrition in JSON format:
            - items: List of detected items (e.g., ["Rice", "Dal", "Paneer", "Curd", "Roti"])
            - totalCalories: Estimated total calories (number)
            - totalCarbs: "High", "Medium", or "Low"
            - totalProtein: "High", "Medium", or "Low"
            - totalFat: "High", "Medium", or "Low"
            - totalFiber: "High", "Medium", or "Low"
            - mealBalanceScore: 1 to 10 (number)
            - feedback: Brief feedback on the thali balance (string)`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
          totalCalories: { type: Type.NUMBER },
          totalCarbs: { type: Type.STRING },
          totalProtein: { type: Type.STRING },
          totalFat: { type: Type.STRING },
          totalFiber: { type: Type.STRING },
          mealBalanceScore: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
        },
        required: ["items", "totalCalories", "mealBalanceScore"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function getChatbotResponse(query: string, userContext?: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      systemInstruction: `You are NutriAI, an expert Indian Nutrition Assistant. 
      Answer ONLY the specific question asked. Do not provide extra information or unsolicited advice. 
      You may briefly ask if the user needs anything else at the end of your response.
      Focus specifically on Indian food, nutrition, and health.
      User Context: ${userContext || "General Indian User"}.`,
    },
  });

  return response.text;
}

export async function generateDietPlan(userData: any): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a personalized 7-day Indian diet plan for:
    Age: ${userData.age}
    Weight: ${userData.weight}kg
    Height: ${userData.height}cm
    Lifestyle: ${userData.lifestyle}
    Goal: ${userData.goal}
    
    Include Breakfast, Lunch, Dinner, and Snacks for each day. 
    Focus on authentic Indian dishes. Format as Markdown.`,
  });

  return response.text;
}
