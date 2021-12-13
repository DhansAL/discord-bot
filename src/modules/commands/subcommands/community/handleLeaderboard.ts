/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import LevelModel from "../../../../database/models/LevelModel";
import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { getRandomValue } from "../../../../utils/getRandomValue";
import { errorEmbedGenerator } from "../../../commands/errorEmbedGenerator";

/**
 * If the server has enabled the level system, this generates an embed
 * containing the top ten users by experience points, their total XP and level,
 * and the rank of the user who called the command.
 */
export const handleLeaderboard: CommandHandler = async (Becca, interaction) => {
  try {
    const { guildId, guild } = interaction;

    if (!guildId || !guild) {
      await interaction.editReply({
        content: getRandomValue(Becca.responses.missingGuild),
      });
      return;
    }
    const serverLevels = await LevelModel.find({
      serverID: guildId,
    })
      .sort({ points: -1 })
      .limit(10)
      .lean()
      .exec();

    if (!serverLevels || !serverLevels.length) {
      await interaction.editReply({
        content: "It would appear that rankings are not enabled here.",
      });
      return;
    }

    const topTen = serverLevels.map(
      (u, index) =>
        `#${index + 1}: ${u.userTag} at level ${u.level} with ${
          u.points
        } experience points.`
    );

    const levelEmbed = new MessageEmbed();
    levelEmbed.setTitle(`${guild.name} leaderboard`);
    levelEmbed.setColor(Becca.colours.default);
    levelEmbed.setDescription(topTen.join("\n"));
    levelEmbed.setTimestamp();
    levelEmbed.setURL(`https://dash.beccalyria.com/leaderboard/${guildId}`);
    levelEmbed.setFooter("Like the bot? Donate: https://donate.nhcarrigan.com");

    const button = new MessageButton()
      .setLabel("View leaderboard")
      .setEmoji("<:BeccaCheer:897545794176045096>")
      .setStyle("LINK")
      .setURL(`https://dash.beccalyria.com/leaderboard/${guildId}`);
    const row = new MessageActionRow().addComponents([button]);

    await interaction.editReply({
      embeds: [levelEmbed],
      components: [row],
    });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "leaderboard command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "leaderboard", errorId)],
    });
  }
};
