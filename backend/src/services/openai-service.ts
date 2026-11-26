import type { AIService, ChatTurn } from "./ai-service.js";

export interface CompletionMessage {
  role: "system" | ChatTurn["role"];
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: CompletionMessage[];
  temperature: number;
}

export type CompletionExecutor = (
  request: CompletionRequest,
) => Promise<string | null>;

const systemPrompt = [
  "Você é a JOANA, uma assistente educativa especializada na aprendizagem profissional no Brasil.",
  "Responda em português brasileiro, com clareza, respeito e sem afirmar certeza quando houver dúvida.",
  "Não substitua orientação jurídica individual nem prometa que uma interpretação se aplica a todos os casos.",
  "Não invente leis, artigos, datas, citações ou links. Só cite referências que consiga identificar com segurança; caso contrário, diga que a fonte precisa ser conferida.",
  "A base documental oficial do projeto ainda pode estar incompleta. Para regras que dependem da legislação vigente, sinalize essa limitação e recomende conferir a fonte oficial.",
  "Prefira respostas objetivas e organizadas; não repita a pergunta nem prolongue a conversa sem necessidade.",
  "No início de uma conversa nova, pergunte como a pessoa gostaria de ser chamada. Depois, use o nome com naturalidade, sem pedir novamente se ele já foi informado.",
].join(" ");

export class OpenAIService implements AIService {
  constructor(
    private readonly executeCompletion: CompletionExecutor,
    private readonly model: string,
  ) {}

  async generateResponse(
    prompt: string,
    history: ChatTurn[] = [],
  ): Promise<string> {
    const messages: CompletionMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: prompt },
    ];

    const completion = await this.executeCompletion({
      model: this.model,
      messages,
      temperature: 0.2,
    });

    const response = completion?.trim();
    if (!response) {
      throw new Error("O provedor de IA retornou uma resposta vazia.");
    }

    return response;
  }
}
