/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandRoleOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from "@discordjs/builders";

import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleLeaderboard } from "../modules/commands/subcommands/community/handleLeaderboard";
import { handleLevel } from "../modules/commands/subcommands/community/handleLevel";
import { handleMotivation } from "../modules/commands/subcommands/community/handleMotivation";
import { handlePoll } from "../modules/commands/subcommands/community/handlePoll";
import { handleRole } from "../modules/commands/subcommands/community/handleRole";
import { handleSchedule } from "../modules/commands/subcommands/community/handleSchedule";
import { handleServer } from "../modules/commands/subcommands/community/handleServer";
import { handleStar } from "../modules/commands/subcommands/community/handleStar";
import { handleStarCount } from "../modules/commands/subcommands/community/handleStarCount";
import { handleSuggest } from "../modules/commands/subcommands/community/handleSuggest";
import { handleTopic } from "../modules/commands/subcommands/community/handleTopic";
import { handleUserInfo } from "../modules/commands/subcommands/community/handleUserInfo";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const community: Command = {
  data: new SlashCommandBuilder()
    .setName("community")
    .setDescription("Handles community-related features")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("leaderboard")
        .setDescription(
          "Shows the community leaderboard if levels are enabled in this server."
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("level")
        .setDescription(
          "Returns your level in the server, or the user's level that you mention."
        )
        .addUserOption(
          new SlashCommandUserOption()
            .setName("user-level")
            .setDescription("User to find the level for")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("role")
        .setDescription("Add or remove a self-assignable role to yourself")
        .addRoleOption(
          new SlashCommandRoleOption()
            .setName("role")
            .setDescription("The role to assign")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("motivation")
        .setDescription("Sends you a little motivational quote.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("schedule")
        .setDescription("Schedules a post to be sent at a later time.")
        .addIntegerOption((option) =>
          option
            .setName("time")
            .setDescription(
              "The time to wait before sending the post, in minutes."
            )
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to send the notification in.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("The message to send.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("star")
        .setDescription("Gives a user a gold star!")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to give a star to.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("The reason for giving the user a star.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("starcount")
        .setDescription(
          "Returns the leaderboard for users who have received stars."
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("topic")
        .setDescription("Provides a conversation starter!")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("userinfo")
        .setDescription("Returns information on the user, or yourself.")
        .addUserOption((option) =>
          option.setName("user").setDescription("The user to lookup.")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("server")
        .setDescription("Returns details on the server.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("suggest")
        .setDescription("Generate a suggestion for the server.")
        .addStringOption((option) =>
          option
            .setName("suggestion")
            .setDescription("The suggestion you want to submit.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("poll")
        .setDescription("Create a poll.")
        .addStringOption((option) =>
          option
            .setName("question")
            .setDescription("The question to ask in the poll.")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("a").setDescription("Option A").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("b").setDescription("Option B").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("c").setDescription("Option C").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("d").setDescription("Option D").setRequired(true)
        )
    ),
  run: async (Becca, interaction, config) => {
    try {
      await interaction.deferReply();
      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case "leaderboard":
          await handleLeaderboard(Becca, interaction, config);
          break;
        case "level":
          await handleLevel(Becca, interaction, config);
          break;
        case "role":
          await handleRole(Becca, interaction, config);
          break;
        case "motivation":
          await handleMotivation(Becca, interaction, config);
          break;
        case "schedule":
          await handleSchedule(Becca, interaction, config);
          break;
        case "star":
          await handleStar(Becca, interaction, config);
          break;
        case "starcount":
          await handleStarCount(Becca, interaction, config);
          break;
        case "topic":
          await handleTopic(Becca, interaction, config);
          break;
        case "userinfo":
          await handleUserInfo(Becca, interaction, config);
          break;
        case "server":
          await handleServer(Becca, interaction, config);
          break;
        case "suggest":
          await handleSuggest(Becca, interaction, config);
          break;
        case "poll":
          await handlePoll(Becca, interaction, config);
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
        "community group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "community group", errorId)],
      });
    }
  },
};
