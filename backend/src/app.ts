import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";

import { env } from "./config/env.js";
import { logger } from "./core/logger.js";

import { healthRoutes } from "./modules/health/index.js";
import { chatRoutes } from "./routes/chat.js";
import { feedbackRoutes } from "./modules/feedback/index.js";
import { initializeFeedbackStore } from "./modules/feedback/feedback-store.js";

export async function buildApp() {
  initializeFeedbackStore();
  const app = Fastify({
    loggerInstance: logger,
    trustProxy: env.TRUST_PROXY === "true",
  });

  const allowedOrigins = env.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: allowedOrigins,
  });
  await app.register(helmet);
  await app.register(sensible);
  await app.register(rateLimit, {
    global: false,
  });

  await app.register(healthRoutes);
  await app.register(chatRoutes);
  await app.register(feedbackRoutes);

  return app;
}