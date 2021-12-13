/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import {
  automodChoices,
  automodToggleChoices,
  automodViewChoices,
} from "../config/commands/settingsChoices";
import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleAutomodReset } from "../modules/commands/subcommands/automod/handleAutomodReset";
import { handleAutomodSet } from "../modules/commands/subcommands/automod/handleAutomodSet";
import { handleAutomodView } from "../modules/commands/subcommands/automod/handleAutomodView";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const automod: Command = {
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Manages the automod config")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("set")
        .setDescription("Set a specific automod setting.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to edit.")
            .addChoices(automodChoices)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("value")
            .setDescription("The value to set the setting to.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("reset")
        .setDescription("Clear the value of a specific setting.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to clear the value of.")
            .addChoices(automodChoices)
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View your logging settings.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to view.")
            .setRequired(true)
            .addChoices(automodViewChoices)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("toggle")
        .setDescription("Toggle an automod feature on or off.")
        .addStringOption((option) =>
          option
            .setName("setting")
            .setDescription("The setting to toggle.")
            .setRequired(true)
            .addChoices(automodToggleChoices)
        )
        .addStringOption((option) =>
          option
            .setName("value")
            .setDescription("Enable/Disable the setting.")
            .setRequired(true)
            .addChoices([
              ["Enabled", "on"],
              ["Disabled", "off"],
            ])
        )
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
        case "toggle":
          await handleAutomodSet(Becca, interaction, config);
          break;
        case "reset":
          await handleAutomodReset(Becca, interaction, config);
          break;
        case "view":
          await handleAutomodView(Becca, interaction, config);
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
        "automod group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "automod group", errorId)],
      });
    }
  },
};
