/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { getCounts } from "../../../becca/getCounts";
import { errorEmbedGenerator } from "../../../commands/errorEmbedGenerator";

/**
 * Generates an embed containing information about Becca.
 */
export const handleAbout: CommandHandler = async (Becca, interaction) => {
  try {
    const { guilds, members, commands } = getCounts(Becca);
    const aboutEmbed = new MessageEmbed();
    aboutEmbed.setColor(Becca.colours.default);
    aboutEmbed.setTitle("Becca Lyria the Discord Bot");
    aboutEmbed.setDescription(
      "Becca Lyria is a Discord bot built for community management and moderation. She includes various tools to help moderate your server, as well as fun commands to drive engagement and interaction among your members. All of her commands use the new slash command interface, which helps your members use the features in a streamlined and clear way."
    );
    aboutEmbed.addField(
      "Version",
      process.env.npm_package_version || "unknown version",
      true
    );
    aboutEmbed.addField("Creation date", "Sunday, 31 May 2020", true);
    aboutEmbed.addField("Guilds", guilds.toString(), true);
    aboutEmbed.addField("Members", members.toString(), true);
    aboutEmbed.addField("Available spells", commands.toString(), true);
    aboutEmbed.addField("Favourite Colour", "Purple", true);
    aboutEmbed.setFooter("Like the bot? Donate: https://donate.nhcarrigan.com");

    const supportServerButton = new MessageButton()
      .setLabel("Join the Support Server")
      .setEmoji("<:BeccaHuh:877278300739887134>")
      .setStyle("LINK")
      .setURL("https://chat.nhcarrigan.com");
    const inviteButton = new MessageButton()
      .setLabel("Add Becca to your server!")
      .setEmoji("<:BeccaHello:867102882791424073>")
      .setStyle("LINK")
      .setURL("https://invite.beccalyria.com");
    const codeButton = new MessageButton()
      .setLabel("View Becca's Source Code")
      .setEmoji("<:BeccaNotes:883854700762505287>")
      .setStyle("LINK")
      .setURL("https://github.com/beccalyria/discord-bot");

    const row = new MessageActionRow().addComponents([
      supportServerButton,
      inviteButton,
      codeButton,
    ]);

    await interaction.editReply({ embeds: [aboutEmbed], components: [row] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "about command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "about", errorId)],
    });
  }
};
