/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import { GuildMember } from "discord.js";

import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleTriggerAdd } from "../modules/commands/subcommands/triggers/handleTriggerAdd";
import { handleTriggerRemove } from "../modules/commands/subcommands/triggers/handleTriggerRemove";
import { handleTriggerView } from "../modules/commands/subcommands/triggers/handleTriggerView";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const triggers: Command = {
  data: new SlashCommandBuilder()
    .setName("triggers")
    .setDescription("Manage triggers for your server.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("add")
        .setDescription("Add a new trigger.")
        .addStringOption((option) =>
          option
            .setName("trigger")
            .setDescription("The text to look for.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("response")
            .setDescription("The response to send when the trigger is seen.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("remove")
        .setDescription("Remove a trigger.")
        .addStringOption((option) =>
          option
            .setName("trigger")
            .setDescription("The trigger to remove.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View a list of triggers in the server.")
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();

      const subcommand = interaction.options.getSubcommand();

      if (
        !(interaction.member as GuildMember).permissions.has("MANAGE_GUILD")
      ) {
        await interaction.editReply({
          content: getRandomValue(Becca.responses.noPermission),
        });
        return;
      }

      switch (subcommand) {
        case "add":
          await handleTriggerAdd(Becca, interaction, config);
          break;
        case "remove":
          await handleTriggerRemove(Becca, interaction, config);
          break;
        case "view":
          await handleTriggerView(Becca, interaction, config);
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
        "triggers group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "triggers group", errorId)],
      });
    }
  },
};
