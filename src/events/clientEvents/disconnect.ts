import { MessageEmbed } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";

/**
 * Sends a message to the debug hook when Becca disconnects.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 */
export const disconnect = async (Becca: BeccaLyria): Promise<void> => {
  const disconnectEmbed = new MessageEmbed();
  disconnectEmbed.setTitle("Becca has disconnected");
  disconnectEmbed.setDescription(
    `${
      Becca.user?.username || "Becca Lyria"
    } is no longer connected to Discord.`
  );
  disconnectEmbed.setTimestamp();
  disconnectEmbed.setColor(Becca.colours.error);
  await Becca.debugHook.send({ embeds: [disconnectEmbed] });
  Becca.pm2.metrics.events.mark();
};
