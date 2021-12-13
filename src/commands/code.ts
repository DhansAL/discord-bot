/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleCanIUse } from "../modules/commands/subcommands/code/handleCanIUse";
import { handleColour } from "../modules/commands/subcommands/code/handleColour";
import { handleHttp } from "../modules/commands/subcommands/code/handleHttp";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const code: Command = {
  data: new SlashCommandBuilder()
    .setName("code")
    .setDescription("Commands related to programming.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("caniuse")
        .setDescription(
          "Returns browser support information for a given feature."
        )
        .addStringOption((option) =>
          option
            .setName("feature")
            .setDescription("The HTML/CSS/JS feature to look up.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("colour")
        .setDescription("Returns an embed showing the colour.")
        .addStringOption((option) =>
          option
            .setName("hex")
            .setDescription("The six digit hex code to display.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("http")
        .setDescription(
          "Shows a cat demonstrating the provided http status code."
        )
        .addIntegerOption((option) =>
          option
            .setName("status")
            .setDescription("The status code to check.")
            .setRequired(true)
        )
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();

      const subCommand = interaction.options.getSubcommand();
      switch (subCommand) {
        case "caniuse":
          await handleCanIUse(Becca, interaction, config);
          break;
        case "colour":
          await handleColour(Becca, interaction, config);
          break;
        case "http":
          await handleHttp(Becca, interaction, config);
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
        "code group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "code group", errorId)],
      });
    }
  },
};
