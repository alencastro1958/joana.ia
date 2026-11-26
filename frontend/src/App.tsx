import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

type ChatMessage = ChatTurn & {
  id: number;
};

type FeedbackCategory = "incorrect" | "offensive" | "other";

type ChatResponse = {
  response?: unknown;
  error?: {
    message?: unknown;
  };
};

const initialMessages: ChatMessage[] = [
  {
    id: 0,
    role: "assistant",
    content:
      "Olá! Eu sou a JOANA, sua assistente sobre aprendizagem profissional. Como você gostaria de ser chamada?",
  },
];

const suggestions = [
  "O que é a aprendizagem profissional?",
  "Quais são os direitos de quem é aprendiz?",
  "Como funciona a parte teórica e prática?",
];

const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function getChatHistory(messages: ChatTurn[], prompt: string): ChatTurn[] {
  let remainingCharacters = 12000 - prompt.length;
  const history: ChatTurn[] = [];

  for (const message of messages.slice(-12).reverse()) {
    if (remainingCharacters <= 0) break;

    const maximumLength = Math.min(4000, remainingCharacters);
    const content = message.content.slice(-maximumLength);
    history.unshift({ role: message.role, content });
    remainingCharacters -= content.length;

    if (content.length < message.content.length) break;
  }

  return history;
}

function getErrorMessage(payload: ChatResponse, status: number): string {
  if (typeof payload.error?.message === "string") {
    return payload.error.message;
  }
  return `A solicitação não foi concluída (HTTP ${status}).`;
}

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<ChatMessage | null>(null);
  const [reportCategory, setReportCategory] =
    useState<FeedbackCategory>("incorrect");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  async function sendMessage(text: string) {
    const prompt = text.trim();
    if (!prompt || isSending) return;

    const history = getChatHistory(messages, prompt);

    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: "user", content: prompt },
    ]);
    setDraft("");
    setIsSending(true);

    try {
      const response = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history }),
      });
      const payload = (await response.json()) as ChatResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(payload, response.status));
      }
      const answer = payload.response;
      if (typeof answer !== "string" || answer.trim().length === 0) {
        throw new Error("A resposta recebida estava vazia. Tente novamente.");
      }

      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível conectar à JOANA. Verifique a conexão e tente novamente.";
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          content: `Não consegui responder agora. ${message}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(draft);
    }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reportTarget || isReporting || reportSent) return;

    setIsReporting(true);
    setReportError("");
    try {
      const response = await fetch(`${apiBase}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: reportCategory,
          response: reportTarget.content,
          details: reportDetails.trim() || undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(`O envio não foi concluído (HTTP ${response.status}).`);
      }
      setReportSent(true);
    } catch (error) {
      setReportError(
        error instanceof Error
          ? error.message
          : "Verifique sua conexão e tente novamente."
      );
    } finally {
      setIsReporting(false);
    }
  }

  function closeReport() {
    setReportTarget(null);
    setReportSent(false);
    setReportError("");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="JOANA IA, início">
          <span className="brand-mark" aria-hidden="true">
            J
          </span>
          <span className="brand-name">
            JOANA<span>IA</span>
          </span>
        </a>
        <div className="topbar-note">
          <span className="status-dot" />
          <span>Aprendizagem profissional</span>
        </div>
      </header>

      <section className="workspace" aria-label="Conversa com a JOANA">
        <aside className="intro-panel">
          <div className="eyebrow">
            <span className="sparkle" aria-hidden="true">
              ✦
            </span>
            Informação para abrir caminhos
          </div>
          <h1>
            Seu próximo passo
            <br />
            começa com <span>clareza.</span>
          </h1>
          <p>
            Tire dúvidas sobre aprendizagem profissional, direitos e formação
            de jovens aprendizes.
          </p>
          <div className="intro-card">
            <span className="intro-card-icon" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong>Uma conversa acolhedora</strong>
              <span>em linguagem simples e direta</span>
            </div>
          </div>
          <div className="decorative-orbit orbit-one" />
          <div className="decorative-orbit orbit-two" />
        </aside>

        <section className="chat-panel" aria-label="Chat">
          <div className="chat-header">
            <div className="assistant-avatar" aria-hidden="true">
              J
              <span />
            </div>
            <div className="assistant-heading">
              <strong>Converse com a JOANA</strong>
              <span>Assistente de aprendizagem profissional</span>
            </div>
            <span className="secure-label">Assistente de IA</span>
          </div>

          <div
            className="conversation"
            ref={conversationRef}
            aria-live="polite"
            aria-relevant="additions text"
          >
            <div className="date-divider">
              <span>COMECE POR AQUI</span>
            </div>
            {messages.map((message) => (
              <article className={`message-row ${message.role}`} key={message.id}>
                {message.role === "assistant" && (
                  <span className="message-avatar" aria-hidden="true">
                    J
                  </span>
                )}
                <div className="message-content">
                  <p className="message-bubble">{message.content}</p>
                  {message.role === "assistant" && message.id !== 0 && (
                    <button
                      className="report-answer"
                      onClick={() => {
                        setReportTarget(message);
                        setReportCategory("incorrect");
                        setReportDetails("");
                        setReportError("");
                        setReportSent(false);
                      }}
                      type="button"
                    >
                      Sinalizar resposta
                    </button>
                  )}
                </div>
              </article>
            ))}
            {messages.length === 1 && (
              <div className="suggestions" aria-label="Sugestões de perguntas">
                {suggestions.map((suggestion) => (
                  <button
                    className="suggestion"
                    key={suggestion}
                    onClick={() => void sendMessage(suggestion)}
                    type="button"
                  >
                    {suggestion}
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            )}
            {isSending && (
              <div className="message-row assistant" role="status">
                <span className="message-avatar" aria-hidden="true">
                  J
                </span>
                <p className="message-bubble typing">
                  <span />
                  <span />
                  <span />
                  <span className="sr-only">JOANA está respondendo</span>
                </p>
              </div>
            )}
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="message">
              Escreva sua pergunta para a JOANA
            </label>
            <textarea
              autoComplete="off"
              id="message"
              maxLength={4000}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escreva sua pergunta..."
              rows={1}
              value={draft}
            />
            <button
              aria-label="Enviar mensagem"
              className="send-button"
              disabled={!draft.trim() || isSending}
              type="submit"
            >
              <span aria-hidden="true">↑</span>
            </button>
          </form>
          <p className="disclaimer">
            Evite enviar dados sensíveis. As mensagens são processadas por um
            provedor de IA. Confirme regras em fontes oficiais; isto não
            substitui orientação jurídica.
          </p>
        </section>
      </section>
      <footer className="site-footer">
        <span>JOANA IA</span>
        <span>Aprendizagem profissional para transformar possibilidades.</span>
        <a className="privacy-link" href="/privacy.html">
          Privacidade
        </a>
      </footer>
      {reportTarget && (
        <div className="report-backdrop">
          <section
            aria-labelledby="report-title"
            aria-modal="true"
            className="report-dialog"
            role="dialog"
          >
            {reportSent ? (
              <>
                <h2 id="report-title">Obrigado pelo aviso</h2>
                <p>
                  A resposta foi enviada para revisão. Isso ajuda a melhorar a
                  JOANA.
                </p>
                <button className="report-submit" onClick={closeReport} type="button">
                  Fechar
                </button>
              </>
            ) : (
              <form onSubmit={submitReport}>
                <h2 id="report-title">Sinalizar uma resposta</h2>
                <p>
                  Enviaremos somente a resposta abaixo, o motivo e seu comentário
                  para revisão. O registro fica armazenado por até 90 dias.
                </p>
                <blockquote>{reportTarget.content}</blockquote>
                <label htmlFor="report-category">Motivo</label>
                <select
                  id="report-category"
                  onChange={(event) => {
                    const category = event.currentTarget.value;
                    if (
                      category === "incorrect" ||
                      category === "offensive" ||
                      category === "other"
                    ) {
                      setReportCategory(category);
                    }
                  }}
                  value={reportCategory}
                >
                  <option value="incorrect">Informação incorreta</option>
                  <option value="offensive">Conteúdo ofensivo</option>
                  <option value="other">Outro problema</option>
                </select>
                <label htmlFor="report-details">Comentário (opcional)</label>
                <textarea
                  id="report-details"
                  maxLength={800}
                  onChange={(event) => setReportDetails(event.target.value)}
                  placeholder="Não inclua dados pessoais."
                  rows={3}
                  value={reportDetails}
                />
                {reportError && (
                  <p className="report-error" role="alert">
                    {reportError}
                  </p>
                )}
                <div className="report-actions">
                  <button
                    className="report-cancel"
                    disabled={isReporting}
                    onClick={closeReport}
                    type="button"
                  >
                    Cancelar
                  </button>
                  <button
                    className="report-submit"
                    disabled={isReporting}
                    type="submit"
                  >
                    {isReporting ? "Enviando..." : "Enviar sinalização"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
