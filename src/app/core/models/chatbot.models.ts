export interface ChatbotReply {
  reply: string;
  intent: string;
  confidence: number;
  quickReplies: string[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  quickReplies?: string[];
}
