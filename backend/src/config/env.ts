import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  HOST: z.string().default("0.0.0.0"),

  PORT: z.coerce.number().default(3000),

  OPENAI_API_KEY: z.string().min(1),

  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini"),

  CORS_ORIGINS: z.string().default("http://localhost:5173"),

  FEEDBACK_DATABASE_PATH: z
    .string()
    .default("data/joana-feedback.sqlite"),

  TRUST_PROXY: z.enum(["true", "false"]).default("false"),
});

export const env = envSchema.parse(process.env);