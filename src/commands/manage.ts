/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleResetLevels } from "../modules/commands/subcommands/manage/handleResetLevels";
import { handleResetStars } from "../modules/commands/subcommands/manage/handleResetStars";
import { handleSuggestion } from "../modules/commands/subcommands/manage/handleSuggestion";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const manage: Command = {
  data: new SlashCommandBuilder()
    .setName("manage")
    .setDescription("Commands for managing your server.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("resetlevels")
        .setDescription("Reset the leaderboard for your server.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("resetstars")
        .setDescription("Reset the star counts for your server.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("suggestion")
        .setDescription("Approve or deny a suggestion.")
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("The action to take on the suggestion.")
            .addChoice("approve", "approve")
            .addChoice("deny", "deny")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The message id of the suggestion to update.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("The reason for approving/denying the suggestion.")
            .setRequired(true)
        )
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();

      const subCommand = interaction.options.getSubcommand();

      switch (subCommand) {
        case "resetlevels":
          await handleResetLevels(Becca, interaction, config);
          break;
        case "resetstars":
          await handleResetStars(Becca, interaction, config);
          break;
        case "suggestion":
          await handleSuggestion(Becca, interaction, config);
          break;
        default:
          await interaction.editReply({
            content: getRandomValue(Becca.responses.invalidCommand),
          });
          break;
      }
      Becca.pm2.metrics.commands.mark();
    } catch (err) {
      const errorId = await beccaErrorHandler(
        Becca,
        "manage group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "manage group", errorId)],
      });
    }
  },
};
