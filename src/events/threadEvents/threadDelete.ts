import { MessageEmbed, ThreadChannel } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";
import { sendLogEmbed } from "../../modules/guild/sendLogEmbed";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

/**
 * Logs the deletion of a thread.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {ThreadChannel} thread Channel object representing the deleted thread.
 */
export const threadDelete = async (
  Becca: BeccaLyria,
  thread: ThreadChannel
): Promise<void> => {
  try {
    const threadEmbed = new MessageEmbed();
    threadEmbed.setTitle("Thread Deleted");
    threadEmbed.setDescription(
      `The thread ${thread.name} in the ${thread.parent?.name} channel was deleted.`
    );
    threadEmbed.setColor(Becca.colours.error);
    threadEmbed.setFooter(`ID: ${thread.id}`);
    threadEmbed.setTimestamp();

    await sendLogEmbed(Becca, thread.guild, threadEmbed, "thread_events");
    Becca.pm2.metrics.events.mark();
  } catch (err) {
    await beccaErrorHandler(Becca, "thread delete event", err);
  }
};
