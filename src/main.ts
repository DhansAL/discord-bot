import "module-alias/register";
import { Client, WebhookClient } from "discord.js";
import connectDatabase from "@Database";
import ClientInt from "@Interfaces/ClientInt";
import extendsClientToClientInt from "@Utils/extendsClientToClientInt";

// Events
import onReady from "@Events/onReady";
import onGuildCreate from "@Events/onGuildCreate";
import onGuildDelete from "@Events/onGuildDelete";
import onMessage from "@Events/onMessage";
import onMessageDelete from "@Events/onMessageDelete";
import onMessageUpdate from "@Events/onMessageUpdate";

async function botConnect(): Promise<void> {
  // Get the node_env from the environment.
  const node_env = process.env.NODE_ENV || "development";

  // Check if the node_env is not production and load the .env file.
  if (node_env !== "production") {
    // Import `dotenv` package.
    const dotenv = await import("dotenv");

    // Load `.env` configuration.
    dotenv.config();
  }

  // Debug channel hook (Send messages here when is debugging).
  let debugChannelHook: WebhookClient | null = null;

  // Check if `WH_ID` and `WH_TOKEN` are configured in the environment.
  if (process.env.WH_ID && process.env.WH_TOKEN) {
    debugChannelHook = new WebhookClient(
      process.env.WH_ID,
      process.env.WH_TOKEN
    );
  }

  // Connect to the MongoDB database.
  await connectDatabase(debugChannelHook);

  // Create a new Discord bot object.
  const client: ClientInt = extendsClientToClientInt(new Client());

  // On bot ready event.
  client.on(
    "ready",
    async () => await onReady(client, debugChannelHook, node_env)
  );

  // On guild create event.
  client.on(
    "guildCreate",
    async (guild) => await onGuildCreate(guild, debugChannelHook, client)
  );

  // On guild delete event.
  client.on(
    "guildDelete",
    async (guild) => await onGuildDelete(guild, debugChannelHook, client)
  );

  // On bot message event.
  client.on("message", async (message) => await onMessage(message, client));

  // On message delete event.
  client.on(
    "messageDelete",
    async (message) => await onMessageDelete(message, client)
  );

  // On message update event.
  client.on(
    "messageUpdate",
    async (oldMessage, newMessage) =>
      await onMessageUpdate(oldMessage, newMessage, client)
  );

  // Log the bot with the Discord token.
  await client.login(process.env.DISCORD_TOKEN);

  // Send a debug log before turn off the bot.
  process.once("beforeExit", () => {
    if (debugChannelHook) {
      debugChannelHook.send(
        `I, ${client.user?.username}, am off to sleep. Goodbye.`
      );
    }
  });
}

botConnect().catch(console.log);
