import { Interaction, Message } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";
import { commandListener } from "../../listeners/commandListener";
import { currencyListener } from "../../listeners/currencyListener";
import { usageListener } from "../../listeners/usageListener";
import { logActivity } from "../../modules/commands/logActivity";
import { getSettings } from "../../modules/settings/getSettings";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

/**
 * Processes logic when a new interaction is created. Interactions come in various
 * forms, and represent some sort of user engagement with Becca on Discord.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {Interaction} interaction The interaction payload received from Discord.
 */
export const interactionCreate = async (
  Becca: BeccaLyria,
  interaction: Interaction
): Promise<void> => {
  try {
    Becca.pm2.metrics.events.mark();
    if (interaction.isCommand()) {
      await logActivity(Becca, interaction.user.id, "command");
      const target = Becca.commands.find(
        (el) => el.data.name === interaction.commandName
      );
      if (!target) {
        interaction.reply({
          content: `That ${interaction.commandName} interaction is not valid...`,
        });
        return;
      }
      if (!interaction.guildId || !interaction.guild) {
        await interaction.reply({
          content: `I prefer my privacy. Please talk to me in a guild instead.`,
        });
        return;
      }
      const config = await getSettings(
        Becca,
        interaction.guildId,
        interaction.guild.name
      );
      if (!config) {
        await interaction.reply({
          content: "I could not find your guild record.",
        });
        return;
      }
      await commandListener.run(Becca, interaction);
      await target.run(Becca, interaction, config);
      await usageListener.run(Becca, interaction);
      await currencyListener.run(Becca, interaction);
    }

    if (interaction.isContextMenu()) {
      await logActivity(Becca, interaction.user.id, "context");
      const target = Becca.contexts.find(
        (el) => el.data.name === interaction.commandName
      );
      if (!target) {
        interaction.reply({
          content: `That ${interaction.commandName} interaction is not valid...`,
        });
        return;
      }
      if (!interaction.guildId || !interaction.guild) {
        await interaction.reply({
          content: `I prefer my privacy. Please talk to me in a guild instead.`,
        });
        return;
      }
      const config = await getSettings(
        Becca,
        interaction.guildId,
        interaction.guild.name
      );
      if (!config) {
        await interaction.reply({
          content: "I could not find your guild record.",
        });
        return;
      }
      await target.run(Becca, interaction, config);
    }

    if (interaction.isButton()) {
      await logActivity(Becca, interaction.user.id, "button");
      if (interaction.customId === "delete-bookmark") {
        await (interaction.message as Message).delete();
      }
    }

    if (interaction.isSelectMenu()) {
      await logActivity(Becca, interaction.user.id, "select");
    }
  } catch (err) {
    await beccaErrorHandler(Becca, "interaction create event", err);
  }
};
