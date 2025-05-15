
export type Stage = 
  | 'precontemplation'
  | 'contemplation'
  | 'preparation'
  | 'action'
  | 'maintenance';

export type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

export type Assessment = {
  importance: number;
  confidence: number;
};

export interface ConversationState {
  messages: Message[];
  currentStage: Stage;
  targetBehavior: string | null;
  assessment: Assessment | null;
  isThinking: boolean;
  isFinalSummary: boolean;
}
