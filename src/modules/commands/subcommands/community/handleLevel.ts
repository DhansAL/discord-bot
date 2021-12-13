/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import LevelModel from "../../../../database/models/LevelModel";
import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { getRandomValue } from "../../../../utils/getRandomValue";
import { errorEmbedGenerator } from "../../../commands/errorEmbedGenerator";

/**
 * Returns the current level ranking information for the given `user-level` or the author.
 * Does not work if levels are disabled.
 */
export const handleLevel: CommandHandler = async (Becca, interaction) => {
  try {
    const { guildId, guild, user } = interaction;

    if (!guildId || !guild) {
      await interaction.editReply({
        content: getRandomValue(Becca.responses.missingGuild),
      });
      return;
    }

    const target = interaction.options.getUser("user-level") || user;

    const targetLevel = await LevelModel.findOne({
      serverID: guildId,
      userID: target.id,
    });

    if (!targetLevel) {
      await interaction.editReply({
        content: `<@!${target.id}> has not earned any levels yet...`,
      });
      return;
    }

    const levelEmbed = new MessageEmbed();
    levelEmbed.setColor(Becca.colours.default);
    levelEmbed.setTitle(`${targetLevel.userTag}'s ranking`);
    levelEmbed.setDescription(`Here is the record I have in \`${guild.name}\``);
    levelEmbed.addField(
      "Experience Points",
      targetLevel.points.toString(),
      true
    );
    levelEmbed.addField("Level", targetLevel.level.toString(), true);
    levelEmbed.addField(
      "Last Seen",
      `${new Date(targetLevel.lastSeen).toLocaleDateString()}`
    );
    levelEmbed.setTimestamp();
    levelEmbed.setFooter("Like the bot? Donate: https://donate.nhcarrigan.com");

    const button = new MessageButton()
      .setLabel("View leaderboard")
      .setEmoji("<:BeccaCheer:897545794176045096>")
      .setStyle("LINK")
      .setURL(`https://dash.beccalyria.com/leaderboard/${guildId}`);
    const row = new MessageActionRow().addComponents([button]);

    await interaction.editReply({ embeds: [levelEmbed], components: [row] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "level command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "level", errorId)],
    });
  }
};
