/* eslint-disable jsdoc/require-param */
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

import { CurrencyHandler } from "../../../../interfaces/commands/CurrencyHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { errorEmbedGenerator } from "../../errorEmbedGenerator";

/**
 * Confirms a user has sufficient currency to claim the `reward` they selected. If so,
 * removes the currency from their balance and sends a message to the currency webhook to
 * notify the owner that a reward has been claimed.
 */
export const handleClaim: CurrencyHandler = async (
  Becca,
  interaction,
  data
) => {
  try {
    const reward = interaction.options.getString("reward");
    const claimEmbed = new MessageEmbed();
    claimEmbed.setTitle("Reward Claimed!");
    claimEmbed.setDescription(
      "Congratulations on claiming a reward! Please note that you will need to join our [support server](https://chat.nhcarrigan.com) and ping `nhcarrigan` so we can work with you to get your prize."
    );
    claimEmbed.setFooter("Like the bot? Donate: https://donate.nhcarrigan.com");

    switch (reward) {
      case "monarch":
        if (data.currencyTotal < 1000) {
          await interaction.editReply(
            `This reward costs 1000 BeccaCoin. You only have ${data.currencyTotal}.`
          );
          return;
        }
        data.currencyTotal -= 1000;
        await data.save();
        claimEmbed.addField(
          "Reward Details",
          "You will take the monarch role from whomever has it in our support server, and you will keep the role until someone else takes it from you."
        );
        break;
      case "emote":
        if (data.currencyTotal < 5000) {
          await interaction.editReply(
            `This reward costs 5000 BeccaCoin. You only have ${data.currencyTotal}.`
          );
          return;
        }
        data.currencyTotal -= 5000;
        await data.save();
        claimEmbed.addField(
          "Reward Details",
          "You will be able to work with nhcarrigan to determine the next pose for a Becca emote. The emote will be available in the support server. nhcarrigan will retain all rights to the art and the character, but we will make an announcement in the support server thanking you for the emote idea."
        );
        break;
      case "feature":
        if (data.currencyTotal < 10000) {
          await interaction.editReply(
            `This reward costs 10000 BeccaCoin. You only have ${data.currencyTotal}.`
          );
          return;
        }
        data.currencyTotal -= 10000;
        await data.save();
        claimEmbed.addField(
          "Reward Details",
          "You will be able to work with nhcarrigan and the development team to suggest a new feature for Becca. We reserve the right to refuse features that are not in line with Becca's primary purpose, but will work with you until you we reach a feature proposal everyone is happy with."
        );
        break;
      case "wealthy":
        if (data.currencyTotal < 25000) {
          await interaction.editReply(
            `This reward costs 25000 BeccaCoin. You only have ${data.currencyTotal}.`
          );
          return;
        }
        data.currencyTotal -= 25000;
        await data.save();
        claimEmbed.addField(
          "Reward Details",
          "You will be given the Wealthy role in our support server. You will keep this role."
        );
        break;
      case "default":
        await interaction.editReply(
          "This somehow appears to be an invalid reward. Please check with the developer team."
        );
        return;
    }

    const supportServerButton = new MessageButton()
      .setLabel("Join Our Server to Redeem your Rewards!")
      .setEmoji("<:BeccaHuh:877278300739887134>")
      .setStyle("LINK")
      .setURL("https://chat.nhcarrigan.com");
    const row = new MessageActionRow().addComponents([supportServerButton]);

    await interaction.editReply({ embeds: [claimEmbed], components: [row] });

    await Becca.currencyHook.send(
      `Hey <@!${Becca.configs.ownerId}>! A reward has been claimed!\n**Reward**: ${reward}\n**Username**: ${interaction.user.username}\n**UserID**: ${interaction.user.id}\nUser in Server? <@!${interaction.user.id}>`
    );
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "claim command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "claim", errorId)],
    });
  }
};
