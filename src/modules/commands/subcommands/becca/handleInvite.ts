/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { errorEmbedGenerator } from "../../../commands/errorEmbedGenerator";

/**
 * Generates an embed containing a link to invite Becca. The link is handled
 * by Becca's domain, to ensure it is up to date with permission and scope
 * changes.
 */
export const handleInvite: CommandHandler = async (Becca, interaction) => {
  try {
    const inviteEmbed = new MessageEmbed();
    inviteEmbed.setTitle("Do you require my assistance?");
    inviteEmbed.setDescription(
      "I suppose I could provide my services to your guild. Click this [invite link](http://invite.beccalyria.com) and I will come serve you. You should also join our [support server](https://chat.nhcarrigan.com)."
    );
    inviteEmbed.setColor(Becca.colours.default);
    inviteEmbed.setFooter(
      "Like the bot? Donate: https://donate.nhcarrigan.com"
    );
    inviteEmbed.setTimestamp();

    const inviteButton = new MessageButton()
      .setLabel("Add Becca to your server!")
      .setEmoji("<:BeccaHello:867102882791424073>")
      .setStyle("LINK")
      .setURL("https://invite.beccalyria.com");
    const supportServerButton = new MessageButton()
      .setLabel("Join the Support Server")
      .setEmoji("<:BeccaHuh:877278300739887134>")
      .setStyle("LINK")
      .setURL("https://chat.nhcarrigan.com");

    const row = new MessageActionRow().addComponents([
      inviteButton,
      supportServerButton,
    ]);

    await interaction.editReply({ embeds: [inviteEmbed], components: [row] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "invite command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "invite", errorId)],
    });
  }
};
