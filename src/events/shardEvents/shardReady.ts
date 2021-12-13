import { MessageEmbed } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";

/**
 * Handles the shardReady event - sends a message to the debug hook when
 * a shard comes online.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {number} shard The number of the shard that has come online.
 */
export const shardReady = async (
  Becca: BeccaLyria,
  shard: number
): Promise<void> => {
  const shardEmbed = new MessageEmbed();
  shardEmbed.setTitle("Shard Online!");
  shardEmbed.setDescription("Becca has brought a new shard online!");
  shardEmbed.addField("Shard", shard.toString());
  shardEmbed.setTimestamp();
  shardEmbed.setColor(Becca.colours.success);

  await Becca.debugHook.send({ embeds: [shardEmbed] });
  Becca.pm2.metrics.events.mark();
};
