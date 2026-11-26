import { FastifyReply, FastifyRequest } from "fastify";
import OpenAI from "openai";
import { z } from "zod";

import { env } from "../config/env.js";
import { fail } from "../shared/api-response.js";
import { OpenAIService } from "../services/openai-service.js";

const chatSchema = z
  .object({
    prompt: z.string().trim().min(1).max(4000),
    history: z
      .array(
        z.discriminatedUnion("role", [
          z.object({
            role: z.literal("user"),
            content: z.string().trim().min(1).max(4000),
          }),
          z.object({
            role: z.literal("assistant"),
            content: z.string().trim().min(1).max(8000),
          }),
        ]),
      )
      .max(12)
      .default([]),
  })
  .superRefine((request, context) => {
    const totalCharacters =
      request.prompt.length +
      request.history.reduce((total, turn) => total + turn.content.length, 0);

    if (totalCharacters > 12000) {
      context.addIssue({
        code: "custom",
        message: "A conversa excede o limite permitido.",
        path: ["history"],
      });
    }
  });

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
const aiService = new OpenAIService(
  async ({ model, messages, temperature }) => {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_completion_tokens: 800,
    });

    return completion.choices[0]?.message.content ?? null;
  },
  env.OPENAI_MODEL,
);

export async function chatController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = chatSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .code(400)
      .send(
        fail(
          "INVALID_CHAT_REQUEST",
          "Envie uma mensagem válida e uma conversa dentro dos limites permitidos.",
          request.id,
        ),
      );
  }

  const { prompt, history } = parsed.data;
  const response = await aiService.generateResponse(prompt, history);

  return reply.send({
    response,
  });
}
