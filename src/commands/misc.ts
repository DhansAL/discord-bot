/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleLevelscale } from "../modules/commands/subcommands/misc/handleLevelscale";
import { handleOrbit } from "../modules/commands/subcommands/misc/handleOrbit";
import { handlePermissions } from "../modules/commands/subcommands/misc/handlePermissions";
import { handleSpace } from "../modules/commands/subcommands/misc/handleSpace";
import { handleUsername } from "../modules/commands/subcommands/misc/handleUsername";
import { handleXkcd } from "../modules/commands/subcommands/misc/handleXkcd";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const misc: Command = {
  data: new SlashCommandBuilder()
    .setName("misc")
    .setDescription("Miscellaneous commands that do not fit other categories")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("space")
        .setDescription("Returns the NASA Astronomy Photo of the Day")
        .addStringOption((option) =>
          option
            .setName("date")
            .setDescription("Date of the photo to fetch, in YYYY-MM-DD format.")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("username")
        .setDescription("Generates a DigitalOcean themed username.")
        .addIntegerOption((option) =>
          option
            .setName("length")
            .setDescription("Maximum length of the username to generate.")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("xkcd")
        .setDescription(
          "Returns the latest XKCD comic, or the specific numbered comic."
        )
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription("Number of the XKCD comic to fetch.")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("permissions")
        .setDescription(
          "Confirms the bot has the correct permissions in the channel and guild."
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("levelscale")
        .setDescription(
          "Returns a map of the level scale used by Becca's levelling system"
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("orbit")
        .setDescription(
          "Provides a leaderboard for global activity within nhcommunity."
        )
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();

      const subCommand = interaction.options.getSubcommand();

      switch (subCommand) {
        case "space":
          await handleSpace(Becca, interaction, config);
          break;
        case "username":
          await handleUsername(Becca, interaction, config);
          break;
        case "xkcd":
          await handleXkcd(Becca, interaction, config);
          break;
        case "permissions":
          await handlePermissions(Becca, interaction, config);
          break;
        case "levelscale":
          await handleLevelscale(Becca, interaction, config);
          break;
        case "orbit":
          await handleOrbit(Becca, interaction, config);
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
        "misc group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "misc group", errorId)],
      });
    }
  },
};
