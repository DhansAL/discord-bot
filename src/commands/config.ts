/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import {
  configChoices,
  configViewChoices,
} from "../config/commands/settingsChoices";
import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleReset } from "../modules/commands/subcommands/config/handleReset";
import { handleSet } from "../modules/commands/subcommands/config/handleSet";
import { handleView } from "../modules/commands/subcommands/config/handleView";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const config: Command = {
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Modify your server settings.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("set")
        .setDescription("Update a server setting.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to update")
            .setRequired(true)
            .addChoices(configChoices)
        )
        .addStringOption((option) =>
          option
            .setName("value")
            .setDescription("The value to set.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("reset")
        .setDescription("Reset a setting to default.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to reset")
            .setRequired(true)
            .addChoices(configChoices)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View your settings.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting list to view.")
            .setRequired(true)
            .addChoices(configViewChoices)
        )
    ),
  run: async (Becca, interaction, serverConfig) => {
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
          await handleSet(Becca, interaction, serverConfig);
          break;
        case "reset":
          await handleReset(Becca, interaction, serverConfig);
          break;
        case "view":
          await handleView(Becca, interaction, serverConfig);
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
        "config group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "config group", errorId)],
      });
    }
  },
};
