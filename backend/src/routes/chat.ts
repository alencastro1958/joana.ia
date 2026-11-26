import { FastifyInstance } from "fastify";

import { chatController } from "../controllers/chat-controller.js";

export async function chatRoutes(app: FastifyInstance) {
  app.post(
    "/chat",
    {
      config: {
        rateLimit: {
          max: 12,
          timeWindow: "1 minute",
        },
      },
    },
    chatController
  );
}