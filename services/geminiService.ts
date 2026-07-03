import { MeetingAgenda, UploadedFile, AgendaItem } from '../types.js';

export const generateAgenda = async (files: UploadedFile[], templateId: string, customInstructions: string = ""): Promise<MeetingAgenda> => {
  try {
    const response = await fetch("/api/generate-agenda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files, templateId, customInstructions })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("You are generating agendas too fast. Please take a small pause before submitting another request.");
      }
      if (response.status === 409) {
        throw new Error("A generation request is currently underway. Please wait until the previous draft compiles.");
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate meeting agenda.");
    }

    return await response.json();
  } catch (error) {
    console.error("generateAgenda API Error:", error);
    throw error;
  }
};

export const suggestNextItem = async (agendaContext: MeetingAgenda, existingItems: AgendaItem[]): Promise<AgendaItem> => {
  try {
    const response = await fetch("/api/suggest-next-item", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ agendaContext, existingItems })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("You are requesting suggestions too fast. Please take a small pause.");
      }
      if (response.status === 409) {
        throw new Error("Another suggestion query is already generating. Please wait a brief moment.");
      }
       const errData = await response.json().catch(() => ({}));
       throw new Error(errData.error || "Failed to suggest next item.");
    }

    return await response.json();
  } catch (error) {
    console.error("suggestNextItem API Error:", error);
    throw error;
  }
};

