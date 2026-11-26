import assert from "node:assert/strict";
import test from "node:test";

import { OpenAIService, type CompletionRequest } from "./openai-service.js";

test("sends conversation context and returns the generated answer", async () => {
  let captured: CompletionRequest | undefined;
  const service = new OpenAIService(async (request) => {
    captured = request;
    return "  Consulte a fonte oficial.  ";
  }, "test-model");

  const response = await service.generateResponse("Qual é a regra?", [
    { role: "assistant", content: "Como posso ajudar?" },
    { role: "user", content: "Meu nome é Joana." },
  ]);

  assert.equal(response, "Consulte a fonte oficial.");
  assert.equal(captured?.model, "test-model");
  assert.equal(captured?.messages[0]?.role, "system");
  assert.deepEqual(
    captured?.messages.slice(1).map(({ role, content }) => ({ role, content })),
    [
      { role: "assistant", content: "Como posso ajudar?" },
      { role: "user", content: "Meu nome é Joana." },
      { role: "user", content: "Qual é a regra?" },
    ]
  );
});

test("rejects an empty provider response instead of reporting success", async () => {
  const service = new OpenAIService(async () => "   ", "test-model");

  await assert.rejects(
    service.generateResponse("Pergunta"),
    /resposta vazia/
  );
});
