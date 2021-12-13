/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleLeave } from "../modules/commands/subcommands/nhcarrigan/handleLeave";
import { handleList } from "../modules/commands/subcommands/nhcarrigan/handleList";
import { handlePurge } from "../modules/commands/subcommands/nhcarrigan/handlePurge";
import { handleRegister } from "../modules/commands/subcommands/nhcarrigan/handleRegister";
import { handleServerData } from "../modules/commands/subcommands/nhcarrigan/handleServerData";
import { handleUnregister } from "../modules/commands/subcommands/nhcarrigan/handleUnregister";
import { handleViewSlash } from "../modules/commands/subcommands/nhcarrigan/handleViewSlash";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const nhcarrigan: Command = {
  data: new SlashCommandBuilder()
    .setName("nhcarrigan")
    .setDescription("Admin Commands locked to the owner.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("list")
        .setDescription("Lists the servers Becca is currently in.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("leave")
        .setDescription("Leaves a specific server.")
        .addStringOption((option) =>
          option
            .setName("server-id")
            .setDescription("Discord ID of the server to leave.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("serverdata")
        .setDescription("Returns information on a specific server.")
        .addStringOption((option) =>
          option
            .setName("server")
            .setDescription("Discord ID of the server to look up.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("register")
        .setDescription("Registers the current slash commands.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("unregister")
        .setDescription("Unregisters a slash command.")
        .addStringOption((option) =>
          option
            .setName("command")
            .setDescription("The slash command to unregister (delete).")
            .setRequired(true)
            .addChoices([
              ["Becca commands", "becca"],
              ["Code commands", "code"],
              ["Community commands", "community"],
              ["Config commands", "config"],
              ["Currency commands", "currency"],
              ["Game commands", "games"],
              ["Management commands", "manage"],
              ["Miscellaneous commands", "misc"],
              ["Moderation commands", "mod"],
            ])
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("viewslash")
        .setDescription("View the currently registered slash commands.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("purge")
        .setDescription("Purges data from the database.")
        .addStringOption((option) =>
          option
            .setName("target")
            .setDescription("ID of the user or server to purge.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("data")
            .setDescription("The type of data to purge.")
            .setRequired(true)
            .addChoices([
              ["Level Data", "levels"],
              ["Activity Tracking", "activity"],
              ["Currency data", "currency"],
              ["Star data", "stars"],
              ["Vote data", "votes"],
              ["Server Command Data", "commands"],
            ])
        )
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const { user } = interaction;

      if (user.id !== Becca.configs.ownerId) {
        await interaction.editReply({
          content: "Only nhcarrigan can use this command.",
        });
        return;
      }

      const subcommand = interaction.options.getSubcommand();

      await Becca.debugHook.send(
        `Hey <@!${Becca.configs.ownerId}>, the ${subcommand} owner command was just used. If this was not you, please investigate!`
      );

      switch (subcommand) {
        case "list":
          await handleList(Becca, interaction, config);
          break;
        case "leave":
          await handleLeave(Becca, interaction, config);
          break;
        case "serverdata":
          await handleServerData(Becca, interaction, config);
          break;
        case "register":
          await handleRegister(Becca, interaction, config);
          break;
        case "unregister":
          await handleUnregister(Becca, interaction, config);
          break;
        case "viewslash":
          await handleViewSlash(Becca, interaction, config);
          break;
        case "purge":
          await handlePurge(Becca, interaction, config);
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
        "nhcarrigan group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "nhcarrigan group", errorId)],
      });
    }
  },
};
