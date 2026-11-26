import { FastifyInstance } from "fastify";

import { feedbackController } from "./feedback.controller.js";

export async function feedbackRoutes(app: FastifyInstance) {
  app.post(
    "/feedback",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 hour",
        },
      },
    },
    feedbackController
  );
}
