/* eslint-disable jsdoc/require-jsdoc */
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";

import { CurrencyOptOut } from "../config/optout/CurrencyOptOut";
import CurrencyModel from "../database/models/CurrencyModel";
import { Command } from "../interfaces/commands/Command";
import { errorEmbedGenerator } from "../modules/commands/errorEmbedGenerator";
import { handleAbout } from "../modules/commands/subcommands/currency/handleAbout";
import { handleClaim } from "../modules/commands/subcommands/currency/handleClaim";
import { handleDaily } from "../modules/commands/subcommands/currency/handleDaily";
import { handleGuess } from "../modules/commands/subcommands/currency/handleGuess";
import { handleSlots } from "../modules/commands/subcommands/currency/handleSlots";
import { handleTwentyOne } from "../modules/commands/subcommands/currency/handleTwentyOne";
import { handleView } from "../modules/commands/subcommands/currency/handleView";
import { handleWeekly } from "../modules/commands/subcommands/currency/handleWeekly";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { getRandomValue } from "../utils/getRandomValue";

export const currency: Command = {
  data: new SlashCommandBuilder()
    .setName("currency")
    .setDescription("Handles Becca's economy system.")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily currency.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("weekly")
        .setDescription("Claim your weekly currency.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("view")
        .setDescription("View your current balance and cooldowns.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("claim")
        .setDescription("Claim a reward with your currency!")
        .addStringOption((option) =>
          option
            .setName("reward")
            .setDescription("The reward you want to claim.")
            .addChoices([
              [
                "Steal the `monarch` role in Becca's Discord server. (1000 BeccaCoin)",
                "monarch",
              ],
              [
                "Choose the pose/design for a Becca Emote (5000 BeccaCoin)",
                "emote",
              ],
              [
                "Request a new feature for Becca that will receive priority (10000 BeccaCoin)",
                "feature",
              ],
              [
                "Claim a special `wealthy` role in Becca's Discord server! (25000 BeccaCoin)",
                "wealthy",
              ],
            ])
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("about")
        .setDescription("Explains how the currency system works.")
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("slots")
        .setDescription("Play slots with Becca!")
        .addIntegerOption((option) =>
          option
            .setName("wager")
            .setDescription("The amount of BeccaCoin you would like to wager.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("21")
        .setDescription("Play a round of 21 against Becca!")
        .addIntegerOption((option) =>
          option
            .setName("wager")
            .setDescription("The amount of BeccaCoin you would like to wager.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("guess")
        .setDescription("Play a guess the number game with Becca.")
        .addIntegerOption((option) =>
          option
            .setName("wager")
            .setDescription("The amount of BeccaCoin you would like to wager.")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("guess")
            .setDescription("Your guess (Choose between 1 and 100!)")
            .setRequired(true)
        )
    ),
  run: async (Becca, interaction) => {
    try {
      await interaction.deferReply();

      if (CurrencyOptOut.includes(interaction.user.id)) {
        await interaction.editReply(
          "You have opted out of the currency system and cannot use these commands."
        );
        return;
      }

      const userData =
        (await CurrencyModel.findOne({ userId: interaction.user.id })) ||
        (await CurrencyModel.create({
          userId: interaction.user.id,
          currencyTotal: 0,
          dailyClaimed: 0,
          weeklyClaimed: 0,
          monthlyClaimed: 0,
          slotsPlayed: 0,
          twentyOnePlayed: 0,
        }));

      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case "daily":
          await handleDaily(Becca, interaction, userData);
          break;
        case "weekly":
          await handleWeekly(Becca, interaction, userData);
          break;
        case "view":
          await handleView(Becca, interaction, userData);
          break;
        case "claim":
          await handleClaim(Becca, interaction, userData);
          break;
        case "about":
          await handleAbout(Becca, interaction, userData);
          break;
        case "slots":
          await handleSlots(Becca, interaction, userData);
          break;
        case "21":
          await handleTwentyOne(Becca, interaction, userData);
          break;
        case "guess":
          await handleGuess(Becca, interaction, userData);
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
        "currency group command",
        err,
        interaction.guild?.name,
        undefined,
        interaction
      );
      await interaction.editReply({
        embeds: [errorEmbedGenerator(Becca, "currency group", errorId)],
      });
    }
  },
};
