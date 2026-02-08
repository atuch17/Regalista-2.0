
import { GoogleGenAI, Type } from "@google/genai";
import { Gift } from "../types";

export const suggestGifts = async (name: string, birthday: string): Promise<Gift[]> => {
  // Always use process.env.API_KEY directly as required by the documentation
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sugiere 2 ideas de regalos creativos y variados para ${name} (su cumpleaños es el ${birthday}). Responde solo con un array de objetos JSON con los campos: "name", "description", "price" (número), "priority" ("high", "medium", or "low").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  priority: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            }
          },
          required: ["suggestions"]
        }
      }
    });

    // Directly access the .text property of GenerateContentResponse
    const data = JSON.parse(response.text || '{"suggestions": []}');
    return data.suggestions.map((s: any) => ({
      id: crypto.randomUUID(),
      name: s.name,
      description: s.description,
      price: s.price || 0,
      priority: s.priority || 'medium',
      status: 'pendiente',
      link: ''
    }));
  } catch (error) {
    console.error("Error fetching gift suggestions:", error);
    return [];
  }
};
