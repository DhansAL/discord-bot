import { Message } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";
import { automodListener } from "../../listeners/automodListener";
import { emoteListener } from "../../listeners/emoteListener";
import { heartsListener } from "../../listeners/heartsListener";
import { levelListener } from "../../listeners/levelListener";
import { sassListener } from "../../listeners/sassListener";
import { triggerListener } from "../../listeners/triggerListener";
import { getSettings } from "../../modules/settings/getSettings";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";
import { registerCommands } from "../../utils/registerCommands";

/**
 * Handles the onMessage event. Validates that the message did not come from
 * another bot, then passes the message through to the listeners and command handler.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {Message} message The message object received in the gateway event.
 */
export const messageCreate = async (
  Becca: BeccaLyria,
  message: Message
): Promise<void> => {
  try {
    const { author, channel, guild } = message;

    if (author.bot) {
      return;
    }

    if (!guild || channel.type === "DM") {
      return;
    }

    const serverConfig = await getSettings(Becca, guild.id, guild.name);

    if (!serverConfig) {
      throw new Error("Could not get server configuration.");
    }

    await heartsListener.run(Becca, message, serverConfig);
    await automodListener.run(Becca, message, serverConfig);
    await levelListener.run(Becca, message, serverConfig);
    await sassListener.run(Becca, message, serverConfig);
    await triggerListener.run(Becca, message, serverConfig);
    await emoteListener.run(Becca, message, serverConfig);

    if (
      message.author.id === Becca.configs.ownerId &&
      message.content === "emergency reload"
    ) {
      await registerCommands(Becca);
      await message.reply("Reloaded all commands.");
    }
    Becca.pm2.metrics.events.mark();
  } catch (err) {
    await beccaErrorHandler(
      Becca,
      "message send event",
      err,
      message.guild?.name,
      message
    );
  }
};
