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
  keyPoints?: string[];
  expectedOutcome?: string;
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

export interface MeetingTemplate {
  id: string;
  name: string;
  structure: string;
  description: string;
}

export const MEETING_TEMPLATES: MeetingTemplate[] = [
  { id: 'auto', name: 'Auto-Detect (AI)', structure: 'Best fit based on content', description: 'Let AI decide the structure' },
  { id: 'standup', name: 'Daily Standup', structure: 'Yesterday / Today / Blockers', description: '15 min sync' },
  { id: 'sprint', name: 'Sprint Planning', structure: 'Goals / Backlog / Estimation', description: '2 hours planning' },
  { id: 'board', name: 'Board Meeting', structure: 'Financials / Strategy / Decisions', description: '90 min review' },
  { id: 'sales', name: 'Sales Pitch', structure: 'Problem / Solution / Demo / Pricing', description: '45 min presentation' },
  { id: 'retro', name: 'Retrospective', structure: 'What worked / What didn\'t / Actions', description: '60 min review' },
  { id: 'kickoff', name: 'Project Kickoff', structure: 'Vision / Roles / Timeline / Risks', description: '90 min start' },
  { id: 'status', name: 'Status Update', structure: 'Progress / Blockers / Next Steps', description: '30 min check-in' },
  { id: 'brainstorm', name: 'Brainstorm', structure: 'Problem / Ideas / Prioritization', description: '60 min creative' },
];