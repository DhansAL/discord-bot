/* eslint-disable require-atomic-updates */
import { RewriteFrames } from "@sentry/integrations";
import * as Sentry from "@sentry/node";
import { Client, WebhookClient } from "discord.js";

import { IntentOptions } from "./config/IntentOptions";
import { connectDatabase } from "./database/connectDatabase";
import { handleEvents } from "./events/handleEvents";
import { BeccaLyria } from "./interfaces/BeccaLyria";
import { loadPM2 } from "./modules/loadPM2";
import { validateEnv } from "./modules/validateEnv";
import { createServer } from "./server/serve";
import { beccaErrorHandler } from "./utils/beccaErrorHandler";
import { beccaLogHandler } from "./utils/beccaLogHandler";
import { loadCommands } from "./utils/loadCommands";
import { loadContexts } from "./utils/loadContexts";
import { registerCommands } from "./utils/registerCommands";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [
    new RewriteFrames({
      root: global.__dirname,
    }),
  ],
});

/**
 * This is the entry point for Becca's process. This will log the boot process,
 * call the necessary helpers to prepare Becca, and then log in to Discord.
 */
(async () => {
  beccaLogHandler.log("debug", "Starting process...");

  const Becca = new Client({
    shards: "auto",
    intents: IntentOptions,
  }) as BeccaLyria;

  beccaLogHandler.log("debug", "Validating environment variables...");
  const validatedEnvironment = validateEnv(Becca);
  if (!validatedEnvironment.valid) {
    beccaLogHandler.log("error", validatedEnvironment.message);
    return;
  }
  const loadedPM2 = loadPM2(Becca);
  if (!loadedPM2) {
    beccaLogHandler.log("error", "Unable to load Grafana metrics");
    return;
  }

  Becca.debugHook = new WebhookClient({ url: Becca.configs.whUrl });
  Becca.currencyHook = new WebhookClient({ url: Becca.configs.currencyUrl });

  beccaLogHandler.log("debug", "Initialising web server...");
  const server = await createServer(Becca);
  if (!server) {
    beccaLogHandler.log("error", "failed to launch web server.");
    return;
  }

  beccaLogHandler.log("debug", "Importing commands...");
  const commands = await loadCommands(Becca);
  const contexts = await loadContexts(Becca);
  Becca.commands = commands;
  Becca.contexts = contexts;
  if (!commands.length || !contexts.length) {
    beccaLogHandler.log("error", "failed to import commands.");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    beccaLogHandler.log("debug", "Registering commands in development...");
    const success = await registerCommands(Becca);
    if (!success) {
      beccaLogHandler.log("error", "failed to register commands.");
      return;
    }
  }

  beccaLogHandler.log("debug", "Initialising database...");
  const databaseConnection = await connectDatabase(Becca);
  if (!databaseConnection) {
    beccaLogHandler.log("error", "failed to connect to database.");
    return;
  }

  beccaLogHandler.log("debug", "Attaching event listeners...");
  handleEvents(Becca);

  beccaLogHandler.log("debug", "Connecting to Discord...");
  await Becca.login(Becca.configs.token);
  beccaLogHandler.log("debug", "Setting activity...");
  Becca.user?.setActivity("over your guild", {
    type: "WATCHING",
  });

  /**
   * Fallthrough error handlers. These fire in rare cases where something throws
   * in a way that our standard catch block cannot see it.
   */
  process.on("unhandledRejection", async (error: Error) => {
    await beccaErrorHandler(Becca, "Unhandled Rejection Error", error);
  });

  process.on("uncaughtException", async (error) => {
    await beccaErrorHandler(Becca, "Uncaught Exception Error", error);
  });
})();
