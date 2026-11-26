import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { fail } from "../../shared/api-response.js";
import { saveResponseReport } from "./feedback-store.js";

const reportSchema = z
  .object({
    category: z.enum(["incorrect", "offensive", "other"]),
    response: z.string().trim().min(1).max(8000),
    details: z.string().trim().max(800).optional(),
  })
  .strict();

export async function feedbackController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const parsed = reportSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply
      .code(400)
      .send(
        fail(
          "INVALID_REPORT",
          "Confira o motivo e a resposta selecionada antes de enviar.",
          request.id,
        ),
      );
  }

  const reportId = saveResponseReport(parsed.data);
  request.log.info({ reportId }, "Resposta da JOANA sinalizada para revisão");

  return reply.code(201).send({ received: true });
}
