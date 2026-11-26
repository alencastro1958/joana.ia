import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function start() {
  const app = await buildApp();

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });

    console.log("==================================");
    console.log("JOANA IA Backend iniciado");
    console.log(`Ambiente : ${env.NODE_ENV}`);
    console.log(`Servidor : http://${env.HOST}:${env.PORT}/health`);
    console.log("==================================");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();