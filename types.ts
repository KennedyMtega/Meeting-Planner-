export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  contact: string;
}

export interface AgendaItem {
  id: string;
  durationMinutes: number;
  topic: string;
  description: string;
  speakerIds: string[];
}

export interface MeetingAgenda {
  title: string;
  summary: string;
  startTime: string; // e.g., "09:00"
  stakeholders: Stakeholder[];
  items: AgendaItem[];
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string; // base64
  size: number;
}

export enum Sender {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  isError?: boolean;
}