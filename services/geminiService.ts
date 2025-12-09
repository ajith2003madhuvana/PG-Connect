import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBlueprintCode = async (component: string, context: string): Promise<string> => {
  if (!process.env.API_KEY) return "// API Key is missing. Please check your environment configuration.";

  const prompt = `
    You are a Senior Java Spring Boot Architect. 
    Generate a robust, production-ready code snippet for a PG Management System.
    
    Context: ${context}
    Requirement: Generate the ${component}.
    
    Strictly follow this stack:
    - Java 17+
    - Spring Boot 3+
    - Spring Data JPA
    - MySQL syntax for SQL
    
    Return ONLY the code block. No markdown backticks, no explanatory text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "// Error generating code. Please try again.";
  }
};

export const generateAdminInsight = async (dataContext: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI insights unavailable without API Key.";

  const prompt = `
    You are an AI Facility Manager assistant.
    Analyze the following data context and provide a brief, actionable insight (max 2 sentences).
    
    Data Context: ${dataContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    return "Could not generate insights at this time.";
  }
};