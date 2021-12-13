import { Message, MessageEmbed, PartialMessage } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";
import { automodListener } from "../../listeners/automodListener";
import { sassListener } from "../../listeners/sassListener";
import { triggerListener } from "../../listeners/triggerListener";
import { sendLogEmbed } from "../../modules/guild/sendLogEmbed";
import { getSettings } from "../../modules/settings/getSettings";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";
import { customSubstring } from "../../utils/customSubstring";

/**
 * Handles the messageUpdate event. Validates that the content in the message
 * changed, then sends an embed with the change details to the log channel.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {Message | PartialMessage} oldMessage Old message object.
 * @param {Message | PartialMessage} newMessage New message object.
 */
export const messageUpdate = async (
  Becca: BeccaLyria,
  oldMessage: Message | PartialMessage,
  newMessage: Message | PartialMessage
): Promise<void> => {
  try {
    const { author, guild, content: newContent } = newMessage;
    const { content: oldContent } = oldMessage;

    if (!guild || newMessage.channel.type === "DM") {
      return;
    }

    const serverConfig = await getSettings(Becca, guild.id, guild.name);

    if (!serverConfig) {
      throw new Error("Could not get server configuration.");
    }

    if (oldContent && newContent && oldContent === newContent) {
      return;
    }

    if (!guild || !author || author.bot) {
      return;
    }

    const updateEmbed = new MessageEmbed();
    updateEmbed.setTitle("Message Updated");
    updateEmbed.setAuthor(
      `${author.username}#${author.discriminator}`,
      author.displayAvatarURL()
    );
    updateEmbed.addField(
      "Old Content",
      customSubstring(oldContent || "`No content here.`", 1000)
    );
    updateEmbed.addField(
      "New Content",
      customSubstring(newContent || "`No content here.`", 1000)
    );
    updateEmbed.setFooter(`Author: ${author.id} | Message: ${oldMessage.id}`);
    updateEmbed.setColor(Becca.colours.default);
    updateEmbed.setTimestamp();
    updateEmbed.addField("Channel", `<#${newMessage.channel.id}>`);
    updateEmbed.addField("Message Link", newMessage.url);

    await sendLogEmbed(Becca, guild, updateEmbed, "message_events");

    const message = await newMessage.fetch();

    await sassListener.run(Becca, message, serverConfig);
    await automodListener.run(Becca, message, serverConfig);
    await triggerListener.run(Becca, message, serverConfig);
    Becca.pm2.metrics.events.mark();
  } catch (err) {
    await beccaErrorHandler(
      Becca,
      "message update event",
      err,
      oldMessage.guild?.name
    );
  }
};
