import { FastifyReply, FastifyRequest } from "fastify";

import { env } from "../../config/env.js";

export async function healthController(
  _request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.send({
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}