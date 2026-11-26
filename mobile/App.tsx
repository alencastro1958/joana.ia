import { StatusBar } from "expo-status-bar";
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useEffect, useRef, useState } from "react";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

type ChatMessage = ChatTurn & {
  id: number;
};

type ChatResponse = {
  response?: unknown;
  error?: {
    message?: unknown;
  };
};

const apiBase = (process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000")
  .replace(/\/+$/, "");

const suggestions = [
  "O que é a aprendizagem profissional?",
  "Quais são os direitos de quem é aprendiz?",
  "Como funciona a parte teórica e prática?",
];

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

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Olá! Eu sou a JOANA, sua assistente sobre aprendizagem profissional. Como você gostaria de ser chamada?",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const nextId = useRef(1);
  const scrollRef = useRef<ScrollViewInstance>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
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
        const detail =
          typeof payload.error?.message === "string"
            ? payload.error.message
            : `HTTP ${response.status}`;
        throw new Error(detail);
      }

      const answer = payload.response;
      if (typeof answer !== "string" || answer.trim().length === 0) {
        throw new Error("A resposta recebida estava vazia.");
      }

      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: "assistant", content: answer },
      ]);
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : "Verifique sua conexão e tente novamente.";
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: "assistant",
          content: `Não consegui responder agora. ${detail}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function sendReport(
    responseText: string,
    category: "incorrect" | "offensive"
  ) {
    try {
      const response = await fetch(`${apiBase}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, response: responseText }),
      });

      if (!response.ok) {
        throw new Error(`O envio não foi concluído (HTTP ${response.status}).`);
      }

      Alert.alert("Obrigado pelo aviso", "A resposta foi enviada para revisão.");
    } catch (error) {
      Alert.alert(
        "Não foi possível enviar",
        error instanceof Error
          ? error.message
          : "Verifique sua conexão e tente novamente."
      );
    }
  }

  function reportAnswer(responseText: string) {
    Alert.alert(
      "Sinalizar resposta",
      "A resposta e o motivo serão enviados para revisão e armazenados por até 90 dias. Não inclua dados pessoais.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Informação incorreta",
          onPress: () => void sendReport(responseText, "incorrect"),
        },
        {
          text: "Conteúdo ofensivo",
          onPress: () => void sendReport(responseText, "offensive"),
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Text style={styles.brandInitial}>J</Text>
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandName}>
            JOANA<Text style={styles.brandIa}> IA</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Aprendizagem profissional</Text>
        </View>
        <View style={styles.headerPill}>
          <View style={styles.headerDot} />
          <Text style={styles.headerPillText}>Assistente</Text>
        </View>
      </View>

      <View style={styles.welcome}>
        <Text style={styles.eyebrow}>INFORMAÇÃO PARA ABRIR CAMINHOS</Text>
        <Text style={styles.title}>
          Aprender. Crescer.{"\n"}
          <Text style={styles.titleAccent}>Ir mais longe.</Text>
        </Text>
        <Text style={styles.description}>
          Tire dúvidas sobre aprendizagem profissional, direitos e formação.
        </Text>
      </View>

      <View style={styles.chatCard}>
        <View style={styles.chatHeader}>
          <View style={styles.smallAvatar}>
            <Text style={styles.smallAvatarText}>J</Text>
          </View>
          <View style={styles.chatHeaderText}>
            <Text style={styles.chatTitle}>Converse com a JOANA</Text>
            <Text style={styles.chatSubtitle}>Estou aqui para ajudar</Text>
          </View>
          <Text style={styles.chatSparkle}>✦</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.role === "user" && styles.userMessageRow,
              ]}
            >
              {message.role === "assistant" && (
                <View style={styles.messageAvatar}>
                  <Text style={styles.messageAvatarText}>J</Text>
                </View>
              )}
              <View style={styles.messageContent}>
                <Text
                  style={[
                    styles.messageBubble,
                    message.role === "user"
                      ? styles.userBubble
                      : styles.assistantBubble,
                  ]}
                >
                  {message.content}
                </Text>
                {message.role === "assistant" && message.id !== 0 && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => reportAnswer(message.content)}
                    style={styles.reportAction}
                  >
                    <Text style={styles.reportActionText}>Sinalizar resposta</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
          {messages.length === 1 && (
            <View style={styles.suggestions}>
              {suggestions.map((suggestion) => (
                <Pressable
                  accessibilityRole="button"
                  key={suggestion}
                  onPress={() => void sendMessage(suggestion)}
                  style={({ pressed }) => [
                    styles.suggestion,
                    pressed && styles.suggestionPressed,
                  ]}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                  <Text style={styles.suggestionArrow}>↗</Text>
                </Pressable>
              ))}
            </View>
          )}
          {isSending && (
            <View style={styles.messageRow} accessibilityLiveRegion="polite">
              <View style={styles.messageAvatar}>
                <Text style={styles.messageAvatarText}>J</Text>
              </View>
              <View style={[styles.messageBubble, styles.assistantBubble]}>
                <ActivityIndicator color="#6954cd" size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Escreva sua pergunta para a JOANA"
            editable={!isSending}
            maxLength={4000}
            multiline
            onChangeText={setDraft}
            onSubmitEditing={() => void sendMessage(draft)}
            placeholder="Escreva sua pergunta..."
            placeholderTextColor="#a19db2"
            returnKeyType="send"
            style={styles.input}
            value={draft}
          />
          <Pressable
            accessibilityLabel="Enviar mensagem"
            accessibilityRole="button"
            disabled={!draft.trim() || isSending}
            onPress={() => void sendMessage(draft)}
            style={({ pressed }) => [
              styles.sendButton,
              (!draft.trim() || isSending) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>
          Evite dados sensíveis. Respostas educativas não substituem orientação
          jurídica.
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>JOANA IA · Informação com acolhimento</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            void Linking.openURL("https://joana.ia.br/privacy.html").catch(
              () =>
                Alert.alert(
                  "Não foi possível abrir",
                  "A política de privacidade não está disponível agora."
                )
            )
          }
        >
          <Text style={styles.privacyLink}>Privacidade</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f5ff",
    paddingTop: Platform.OS === "android" ? 14 : 54,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6b55d9",
  },
  brandInitial: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  brandText: {
    marginLeft: 10,
  },
  brandName: {
    color: "#28243f",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  brandIa: {
    color: "#6b55d9",
  },
  brandSubtitle: {
    marginTop: 2,
    color: "#77748b",
    fontSize: 10,
  },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#eeebfa",
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#6aaf83",
  },
  headerPillText: {
    color: "#5b5675",
    fontSize: 10,
    fontWeight: "600",
  },
  welcome: {
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  eyebrow: {
    color: "#6b55d9",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  title: {
    marginTop: 8,
    color: "#29253f",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 33,
  },
  titleAccent: {
    color: "#6b55d9",
  },
  description: {
    maxWidth: 350,
    marginTop: 7,
    color: "#716e83",
    fontSize: 12,
    lineHeight: 18,
  },
  chatCard: {
    flex: 1,
    minHeight: 300,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e9e5f4",
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowColor: "#45378b",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  chatHeader: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0eef6",
  },
  smallAvatar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#7661df",
  },
  smallAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  chatHeaderText: {
    marginLeft: 9,
  },
  chatTitle: {
    color: "#302c47",
    fontSize: 12,
    fontWeight: "700",
  },
  chatSubtitle: {
    marginTop: 3,
    color: "#8a8799",
    fontSize: 10,
  },
  chatSparkle: {
    marginLeft: "auto",
    color: "#a99bed",
    fontSize: 18,
  },
  messages: {
    flexGrow: 1,
    gap: 12,
    padding: 14,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 7,
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#7661df",
  },
  messageAvatarText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  messageBubble: {
    maxWidth: "84%",
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    fontSize: 12,
    lineHeight: 18,
  },
  messageContent: {
    maxWidth: "84%",
    alignItems: "flex-start",
    gap: 4,
  },
  reportAction: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  reportActionText: {
    color: "#77718f",
    fontSize: 9,
    textDecorationLine: "underline",
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    color: "#4b4860",
    backgroundColor: "#f1eff9",
  },
  userBubble: {
    borderBottomRightRadius: 4,
    color: "#fff",
    backgroundColor: "#6b55d9",
  },
  suggestions: {
    gap: 7,
    marginLeft: 32,
  },
  suggestion: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e9e5f6",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  suggestionPressed: {
    backgroundColor: "#f5f2ff",
  },
  suggestionText: {
    flex: 1,
    color: "#5c557f",
    fontSize: 10,
  },
  suggestionArrow: {
    color: "#6b55d9",
    fontSize: 14,
  },
  composer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 11,
    paddingLeft: 12,
    paddingRight: 7,
    borderWidth: 1,
    borderColor: "#e6e2f1",
    borderRadius: 15,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingVertical: 10,
    color: "#28243f",
    fontSize: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#6b55d9",
  },
  sendButtonDisabled: {
    backgroundColor: "#c8c3df",
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendButtonText: {
    marginTop: -2,
    color: "#fff",
    fontSize: 21,
    fontWeight: "600",
  },
  disclaimer: {
    marginHorizontal: 13,
    marginTop: 8,
    marginBottom: 12,
    color: "#918da2",
    fontSize: 9,
    lineHeight: 13,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 9,
  },
  footerText: {
    color: "#918da2",
    fontSize: 9,
  },
  privacyLink: {
    color: "#6254b0",
    fontSize: 9,
    textDecorationLine: "underline",
  },
});
