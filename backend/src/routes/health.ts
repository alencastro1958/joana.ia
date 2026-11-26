import { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => {
    return {
      status: "ok",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  });
}