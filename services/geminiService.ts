import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MeetingAgenda, ChatMessage, Sender } from '../types';

const apiKey = process.env.API_KEY;
// Note: In a production app, handle missing API key gracefully
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

const agendaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the meeting" },
    summary: { type: Type.STRING, description: "A brief 1-2 sentence summary of the meeting's purpose" },
    startTime: { type: Type.STRING, description: "Suggested start time in 24h format e.g. '09:00'" },
    stakeholders: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
           name: { type: Type.STRING },
           role: { type: Type.STRING, description: "Job title or role in meeting" },
           contact: { type: Type.STRING, description: "Email or department if available" }
        },
        required: ["name", "role"]
      },
      description: "List of people or roles involved"
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          durationMinutes: { type: Type.NUMBER, description: "Duration of this topic in minutes" },
          topic: { type: Type.STRING, description: "Main topic header" },
          description: { type: Type.STRING, description: "Details about what will be discussed" },
          suggestedSpeakerName: { type: Type.STRING, description: "Name of the stakeholder who should speak" },
          keyPoints: { 
             type: Type.ARRAY, 
             items: { type: Type.STRING }, 
             description: "List of 2-3 specific points to discuss or questions to answer" 
          },
          expectedOutcome: { type: Type.STRING, description: "The specific goal, decision, or deliverable expected from this item" }
        },
        required: ["topic", "durationMinutes", "description"]
      }
    }
  },
  required: ["title", "stakeholders", "items", "startTime"]
};

// Helper to generate UUID-like strings
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateAgendaFromFile = async (fileBase64: string, mimeType: string): Promise<MeetingAgenda> => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: "Analyze this document and generate a structured meeting agenda. Identify key stakeholders (with roles), topics to discuss, and estimate time for each based on the content complexity. Include key discussion points and expected outcomes for each topic. If the document is not about a meeting, create a review meeting agenda for it."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: agendaSchema,
        temperature: 0.4,
      }
    });

    if (response.text) {
      const rawData = JSON.parse(response.text);
      
      // Post-process to add IDs and link speakers
      const stakeholders = (rawData.stakeholders || []).map((s: any) => ({
        ...s,
        id: generateId(),
        contact: s.contact || ''
      }));

      const items = (rawData.items || []).map((item: any) => {
        // Try to find the stakeholder ID by name match
        const matchedStakeholder = stakeholders.find((s: any) => 
          item.suggestedSpeakerName && s.name.toLowerCase().includes(item.suggestedSpeakerName.toLowerCase())
        );
        
        return {
          id: generateId(),
          topic: item.topic,
          description: item.description,
          durationMinutes: item.durationMinutes,
          speakerIds: matchedStakeholder ? [matchedStakeholder.id] : [],
          keyPoints: item.keyPoints || [],
          expectedOutcome: item.expectedOutcome || ''
        };
      });

      return {
        title: rawData.title,
        summary: rawData.summary,
        startTime: rawData.startTime || "09:00",
        stakeholders,
        items
      };
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Agenda Generation Error:", error);
    throw error;
  }
};

export class ChatSession {
  private chat: any;
  private filePart: any;

  constructor(fileBase64: string, mimeType: string) {
    this.filePart = {
      inlineData: {
        mimeType: mimeType,
        data: fileBase64
      }
    };
  }

  async init() {
    if (!apiKey) throw new Error("API Key is missing");
    
    // We use gemini-3-pro-preview as requested for the chatbot
    this.chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: [
        {
          role: 'user',
          parts: [
            this.filePart,
            { text: "I have uploaded this document. Please answer my future questions based on it. Be concise and helpful." }
          ]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I have analyzed the document and am ready to answer your questions." }]
        }
      ],
    });
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.chat) await this.init();
    
    try {
      const response = await this.chat.sendMessage({ message });
      return response.text || "I couldn't generate a response.";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }
}
