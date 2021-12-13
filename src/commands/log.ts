/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { logChoices } from "../config/commands/settingsChoices";
import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleLogReset } from "../modules/commands/subcommands/log/handleLogReset";
import { handleLogSet } from "../modules/commands/subcommands/log/handleLogSet";
import { handleLogView } from "../modules/commands/subcommands/log/handleLogView";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const log: Command = {
  data: new SlashCommandBuilder()
    .setName("log")
    .setDescription("Manages the logging config.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("set")
        .setDescription("Set a channel for a specific logging type")
        .addStringOption((option) =>
          option
            .setName("event")
            .setDescription("The type of events to log")
            .addChoices(logChoices)
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to log the events in.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("reset")
        .setDescription("Clear the logging option for a specific event.")
        .addStringOption((option) =>
          option
            .setName("event")
            .setDescription("The type of events to log")
            .addChoices(logChoices)
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View your logging settings.")
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();
      const { guild, member } = interaction;

      if (!guild || !member) {
        await interaction.editReply({
          content: getRandomValue(Becca.responses.missingGuild),
        });
        return;
      }

      if (
        (typeof member.permissions === "string" ||
          !member.permissions.has("MANAGE_GUILD")) &&
        member.user.id !== Becca.configs.ownerId
      ) {
        await interaction.editReply({
          content: getRandomValue(Becca.responses.noPermission),
        });
        return;
      }

      const action = interaction.options.getSubcommand();
      switch (action) {
        case "set":
          await handleLogSet(Becca, interaction, config);
          break;
        case "reset":
          await handleLogReset(Becca, interaction, config);
          break;
        case "view":
          await handleLogView(Becca, interaction, config);
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
        "log group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "log group", errorId)],
      });
    }
  },
};
