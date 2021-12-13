/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { errorEmbedGenerator } from "../../errorEmbedGenerator";

/**
 * Generates an embed with a link to Becca's profile site, where users
 * can read about her adventures.
 */
export const handleProfile: CommandHandler = async (Becca, interaction) => {
  try {
    const profileEmbed = new MessageEmbed();
    profileEmbed.setColor(Becca.colours.default);
    profileEmbed.setTitle("Becca Lyria");
    profileEmbed.setDescription(
      "If you want to read about my adventures, check my [profile site](https://www.beccalyria.com). I would rather not have to recount them all here."
    );
    profileEmbed.setThumbnail(Becca.user?.avatarURL({ dynamic: true }) || "");
    profileEmbed.setFooter(
      "Like the bot? Donate: https://donate.nhcarrigan.com"
    );

    const profileButton = new MessageButton()
      .setLabel("View Becca's Profile")
      .setEmoji("<:BeccaHello:867102882791424073>")
      .setStyle("LINK")
      .setURL("https://www.beccalyria.com");

    const row = new MessageActionRow().addComponents([profileButton]);

    await interaction.editReply({ embeds: [profileEmbed], components: [row] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "profile command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "profile", errorId)],
    });
  }
};
