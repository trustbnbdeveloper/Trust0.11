import { GoogleGenAI } from "@google/genai";

// NOTE: This file contains a client-side stub for local/demo use only.
// Do NOT embed or rely on process.env.API_KEY in the client bundle for production —
// secrets must be stored server-side (e.g. via a Cloudflare Worker). For production, use `services/geminiProxy.ts` to call the Worker proxy.
// Initialize the API client
// Note: In a real deployment, ensure process.env.API_KEY is set.
// For the purpose of this prototype, we handle the missing key gracefully in the UI.
let apiKey = '';
try {
    apiKey = process.env.API_KEY || '';
} catch (error) {
    // Ignore ReferenceError if process is not defined in the browser runtime
    console.warn("process.env.API_KEY not found");
}

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateAIResponse = async (userMessage: string, context: string): Promise<string> => {
  if (!ai) {
    // Fallback for demo purposes if no key is provided in the environment
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("I am the TrustBnB AI Assistant. To activate real intelligence, please configure the API_KEY. For now, I can confirm that your property 'Villa Saranda' is performing 15% above market average.");
      }, 1000);
    });
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are the TrustBnB AI Assistant. 
    Your tone is Professional, Calm, Reliable, and Discreet.
    You help property owners from the Albanian diaspora manage their properties.
    You have access to the following context: ${context}.
    Keep answers concise and reassuring.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I apologize, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered a temporary issue connecting to the intelligence center. Please try again.";
  }
};