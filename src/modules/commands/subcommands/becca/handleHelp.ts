/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { CommandHandler } from "../../../../interfaces/commands/CommandHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { errorEmbedGenerator } from "../../../commands/errorEmbedGenerator";

/**
 * Generates an embed containing information on how to interact with Becca,
 * links to the support server, docs, and code.
 */
export const handleHelp: CommandHandler = async (Becca, interaction) => {
  try {
    const helpEmbed = new MessageEmbed();
    helpEmbed.setTitle("How to Interact with Becca");
    helpEmbed.setDescription(
      "Hello there! I have many spells I can cast. To see the spells, type `/` and select my section from the pop-up menu."
    );
    helpEmbed.addField(
      "Support Server",
      "If you need some extra guidance, join my support server where my minions will be glad to serve you."
    );
    helpEmbed.addField(
      "Documentation",
      "As an alternative, you are welcome to view my instruction manual to see what I can do."
    );
    helpEmbed.addField(
      "Source Code",
      "Should you be feeling extra ambitious, you can also dive in to my spellbook and look at my abilities yourself."
    );
    helpEmbed.addField(
      "Bug Report",
      "Have I failed you in some way? You can report an issue, or let us know in the support server."
    );
    helpEmbed.addField(
      "Privacy Policy",
      "As part of my services, I collect and use some specific Discord related information. This information includes, but may not be limited to, your user name, nickname, this server's name, and your Discord ID. [View my full policy](https://github.com/BeccaLyria/discord-bot/blob/main/PRIVACY.md)"
    );
    helpEmbed.setFooter("Like the bot? Donate: https://donate.nhcarrigan.com");

    const supportServerButton = new MessageButton()
      .setLabel("Join the Support Server")
      .setEmoji("<:BeccaHuh:877278300739887134>")
      .setStyle("LINK")
      .setURL("https://chat.nhcarrigan.com");
    const inviteButton = new MessageButton()
      .setLabel("Add Becca to your server!")
      .setEmoji("<:BeccaHello:867102882791424073>")
      .setStyle("LINK")
      .setURL("https://invite.beccalyria.com");
    const codeButton = new MessageButton()
      .setLabel("View Becca's Source Code")
      .setEmoji("<:BeccaNotes:883854700762505287>")
      .setStyle("LINK")
      .setURL("https://github.com/beccalyria/discord-bot");
    const docsButton = new MessageButton()
      .setLabel("View the Documentation")
      .setEmoji("<:BeccaSalute:872577687590420501>")
      .setStyle("LINK")
      .setURL("https://docs.beccalyria.com");
    const reportButton = new MessageButton()
      .setLabel("Report an Issue")
      .setEmoji("<:BeccaBan:897545793886634085>")
      .setStyle("LINK")
      .setURL("https://github.com/beccalyria/discord-bot/issues/new/choose");

    const row = new MessageActionRow().addComponents([
      supportServerButton,
      inviteButton,
      codeButton,
      docsButton,
      reportButton,
    ]);

    await interaction.editReply({ embeds: [helpEmbed], components: [row] });
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "help command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "help", errorId)],
    });
  }
};
