import { MeetingAgenda, UploadedFile } from '../types.js';

export const generateAgenda = async (files: UploadedFile[], templateId: string): Promise<MeetingAgenda> => {
  try {
    const response = await fetch("/api/generate-agenda", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files, templateId })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate meeting agenda.");
    }

    return await response.json();
  } catch (error) {
    console.error("generateAgenda API Error:", error);
    throw error;
  }
};

export class ChatSession {
  private files: UploadedFile[];
  private agendaContext?: MeetingAgenda;
  private messages: Array<{ sender: string; text: string }> = [];

  constructor(files: UploadedFile[], agendaContext?: MeetingAgenda) {
    this.files = files;
    this.agendaContext = agendaContext;
  }

  async init() {
    this.messages = [];
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: this.files,
          agendaContext: this.agendaContext,
          messages: this.messages,
          message: message
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to process chat request.");
      }

      const data = await response.json();
      
      this.messages.push({ sender: 'user', text: message });
      this.messages.push({ sender: 'model', text: data.text });

      return data.text;
    } catch (error) {
      console.error("Chat Session API Error:", error);
      throw error;
    }
  }
}
