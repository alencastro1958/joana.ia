import pino, { LoggerOptions } from "pino";

const options: LoggerOptions = {
  level: process.env.LOG_LEVEL ?? "info",
  serializers: {
    req(request: {
      method?: string;
      url?: string;
      headers?: { host?: string };
    }) {
      return {
        method: request.method,
        url: request.url,
        host: request.headers?.host,
      };
    },
  },
};

if (process.env.NODE_ENV === "development") {
  options.transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  };
}

export const logger = pino(options);