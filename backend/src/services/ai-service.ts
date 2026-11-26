export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AIService {
  generateResponse(prompt: string, history?: ChatTurn[]): Promise<string>;
}