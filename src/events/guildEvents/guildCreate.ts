import { Guild, MessageEmbed } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";

/**
 * Generates an embed when Becca joins a guild and sends it to the debug hook.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {Guild} guild The guild object for the server Becca joined.
 */
export const guildCreate = async (
  Becca: BeccaLyria,
  guild: Guild
): Promise<void> => {
  const owner = await guild.members.fetch(guild.ownerId);
  const guildCreateEmbed = new MessageEmbed();
  guildCreateEmbed.setTitle(
    `${Becca.user?.username || "Becca Lyria"} has been enlisted in a new guild!`
  );
  guildCreateEmbed.setDescription(
    "It would seem they have need of my services."
  );
  guildCreateEmbed.addField("Guild Name", guild.name, true);
  guildCreateEmbed.addField(
    "Guild Owner",
    owner.user.username || "No owner data available.",
    true
  );
  guildCreateEmbed.addField("Guild ID", guild.id, true);
  guildCreateEmbed.addField(
    "Guild Owner ID",
    owner.id || "No owner data available",
    true
  );
  guildCreateEmbed.setColor(Becca.colours.success);
  guildCreateEmbed.setTimestamp();

  await Becca.debugHook.send({ embeds: [guildCreateEmbed] });

  Becca.pm2.metrics.guilds.set(Becca.pm2.metrics.guilds.val() + 1);
  Becca.pm2.metrics.events.mark();
};
