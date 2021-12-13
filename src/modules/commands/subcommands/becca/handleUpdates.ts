/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import {
  nextScheduledRelease,
  updatesSinceLastRelease,
} from "../../../../config/commands/updatesData";
import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { errorEmbedGenerator } from "../../errorEmbedGenerator";

/**
 * Generates an embed explaining the new release schedule, and what the update
 * process breaks in terms of lost cache.
 */
export const handleUpdates: CommandHandler = async (Becca, interaction) => {
  try {
    const { commitHash: hash } = Becca;
    const updateEmbed = new MessageEmbed();
    updateEmbed.setTitle("Update Information");
    updateEmbed.setDescription(
      "Becca's updates are deployed every Sunday around 8AM Pacific Time. This is important information to know, as these deployments clear the cache. This results in any outstanding cache-reliant features, such as polls, trivia games, or scheduled posts, to be lost. Please plan your interactions around this schedule."
    );
    updateEmbed.addField("Latest Updates", updatesSinceLastRelease.join("\n"));
    updateEmbed.addField(
      "Current Version",
      process.env.npm_package_version || "0.0.0"
    );
    updateEmbed.addField("Next Scheduled Update", nextScheduledRelease);
    updateEmbed.addField(
      "Changelog",
      "View Becca's entire change log [in her documentation](https://docs.beccalyria.com/#/changelog)."
    );
    updateEmbed.addField(
      "Commit Hash",
      `[${hash.slice(
        0,
        7
      )}](https://github.com/beccalyria/discord-bot/commit/${hash})`
    );
    updateEmbed.setColor(Becca.colours.default);
    updateEmbed.setFooter(
      "Like the bot? Donate: https://donate.nhcarrigan.com"
    );

    const button = new MessageButton()
      .setLabel("View Changelog")
      .setEmoji("<:BeccaNotes:883854700762505287>")
      .setStyle("LINK")
      .setURL("https://docs.beccalyria.com/#/changelog");

    const row = new MessageActionRow().addComponents([button]);
    await interaction.editReply({ embeds: [updateEmbed], components: [row] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "updates command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "updates", errorId)],
    });
  }
};
