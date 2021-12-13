/* eslint-disable jsdoc/require-jsdoc */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import CommandCountModel from "../../../../database/models/CommandCountModel";
import VoterModel from "../../../../database/models/VoterModel";
import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { getRandomValue } from "../../../../utils/getRandomValue";
import { errorEmbedGenerator } from "../../errorEmbedGenerator";

export const handleStats: CommandHandler = async (Becca, interaction) => {
  try {
    const { guild, user: author } = interaction;
    if (!guild || !author) {
      await interaction.editReply({
        content: getRandomValue(Becca.responses.missingGuild),
      });
      return;
    }

    const view = interaction.options.getString("view");

    if (view === "commands") {
      const topServers = await CommandCountModel.find()
        .sort({ commandUses: -1 })
        .limit(10)
        .lean();

      // TODO: Update using a formatted text table.
      // see #883
      const topServersEmbed = topServers
        .map(
          (server, index) =>
            `#${index + 1}: ${server.serverName} with ${
              server.commandUses
            } command uses`
        )
        .join("\n");

      const commandEmbed = new MessageEmbed();
      commandEmbed.setTitle("Command Stats");
      commandEmbed.setTimestamp();
      commandEmbed.setColor(Becca.colours.default);
      commandEmbed.setAuthor(
        `${author.username}#${author.discriminator}`,
        author.displayAvatarURL()
      );
      commandEmbed.setDescription(topServersEmbed);
      commandEmbed.setFooter(
        "Like the bot? Donate: https://donate.nhcarrigan.com"
      );

      await interaction.editReply({
        embeds: [commandEmbed],
      });
      return;
    }

    if (view === "svotes") {
      const topVotes = await VoterModel.find()
        .sort({ serverVotes: -1 })
        .limit(10)
        .lean();

      const serverVoteEmbed = topVotes
        .map(
          (el, i) => `#${i + 1}: <@!${el.userId}> with ${el.serverVotes} votes.`
        )
        .join("\n");

      const serverEmbed = new MessageEmbed();
      serverEmbed.setTitle("Server Vote Stats");
      serverEmbed.setTimestamp();
      serverEmbed.setColor(Becca.colours.default);
      serverEmbed.setAuthor(
        `${author.username}#${author.discriminator}`,
        author.displayAvatarURL()
      );
      serverEmbed.setDescription(serverVoteEmbed);
      serverEmbed.setFooter(
        "Like the bot? Donate: https://donate.nhcarrigan.com"
      );

      const supportServerButton = new MessageButton()
        .setLabel("Join the Support Server")
        .setEmoji("<:BeccaHello:867102882791424073>")
        .setStyle("LINK")
        .setURL("https://chat.nhcarrigan.com");
      const voteServerButton = new MessageButton()
        .setLabel("Vote for the Server")
        .setEmoji("<:BeccaWoah:877278300949585980>")
        .setStyle("LINK")
        .setURL("https://top.gg/servers/778130114772598785/vote");

      const row = new MessageActionRow().addComponents([
        supportServerButton,
        voteServerButton,
      ]);

      await interaction.editReply({ embeds: [serverEmbed], components: [row] });
      return;
    }

    if (view === "bvotes") {
      /*
      TODO: When Becca is on top.gg, enable this.
      const topVotes = await VoterModel.find()
        .sort({ botVotes: -1 })
        .limit(10)
        .lean();

      const botVoteEmbed = topVotes
        .map(
          (el, i) => `#${i + 1}: <@!${el.userId}> with ${el.botVotes} votes.`
        )
        .join("\n");

      const botEmbed = new MessageEmbed();
      botEmbed.setTitle("Bot Vote Stats");
      botEmbed.setTimestamp();
      botEmbed.setColor(Becca.colours.default);
      botEmbed.setAuthor(
        `${author.username}#${author.discriminator}`,
        author.displayAvatarURL()
      );
      botEmbed.setDescription(botVoteEmbed);
      */

      const botEmbed = new MessageEmbed();
      botEmbed.setTitle("Coming Soon!");
      botEmbed.setDescription(
        "We are waiting to list Becca on top.gg until after we complete the Discord verification process. Stay tuned!"
      );
      botEmbed.setFooter("Like the bot? Donate: https://donate.nhcarrigan.com");

      await interaction.editReply({ embeds: [botEmbed] });
      return;
    }

    await interaction.editReply({
      content:
        "That appears to be an invalid stat. Not sure how that happened.",
    });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "stats command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "stats", errorId)],
    });
  }
};
