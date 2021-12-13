/* eslint-disable jsdoc/require-param */
import { MessageEmbed } from "discord.js";

import { CurrencyHandler } from "../../../../interfaces/commands/CurrencyHandler";
import { beccaErrorHandler } from "../../../../utils/beccaErrorHandler";
import { parseSeconds } from "../../../../utils/parseSeconds";
import { errorEmbedGenerator } from "../../errorEmbedGenerator";

/**
 * Grants the user a bonus currency amount between 25 and 100. Can be used
 * once every 7 days.
 */
export const handleWeekly: CurrencyHandler = async (
  Becca,
  interaction,
  data
) => {
  try {
    const now = Date.now();
    const canClaim = now - 604800000 > data.weeklyClaimed;

    const homeServer = await interaction.client.guilds.fetch(
      Becca.configs.homeGuild
    );
    const userIsMember = await homeServer.members
      .fetch(interaction.user.id)
      .catch(() => null);

    if (!userIsMember) {
      const nopeEmbed = new MessageEmbed();
      nopeEmbed.setTitle("Uh oh!");
      nopeEmbed.setDescription(
        "Weekly rewards are only available to members of our support server! You can [join with this link](https://chat.nhcarrigan.com) and come hang out with us!"
      );
      nopeEmbed.setColor(Becca.colours.error);
      await interaction.editReply({ embeds: [nopeEmbed] });
      return;
    }

    if (!canClaim) {
      const cooldown = data.weeklyClaimed - now + 604800000;
      await interaction.editReply({
        content: `You have already claimed your weekly!\nCome back in: ${parseSeconds(
          Math.ceil(cooldown / 1000)
        )}`,
      });
      return;
    }

    const earnedCurrency = Math.round(Math.random() * 75 + 25);

    data.currencyTotal += earnedCurrency;
    data.weeklyClaimed = now;
    await data.save();

    const embed = new MessageEmbed();
    embed.setTitle("Weekly Reward!");
    embed.setDescription(
      `You've earned ${earnedCurrency} BeccaCoin! You now have ${data.currencyTotal} BeccaCoin.`
    );
    embed.setColor(Becca.colours.default);

    await interaction.editReply({ embeds: [embed] });
    await Becca.currencyHook.send(
      `**Weekly Reward Claimed!**\n\n*User*: ${interaction.user.username}\n*UserID*: ${interaction.user.id}\n*Server*: ${interaction.guild?.name}\n*ServerID*: ${interaction.guildId}\n*Earned*: ${earnedCurrency} - *Total*: ${data.currencyTotal}`
    );
  } catch (err) {
    const errorId = await beccaErrorHandler(
      Becca,
      "weekly command",
      err,
      interaction.guild?.name,
      undefined,
      interaction
    );
    await interaction.editReply({
      embeds: [errorEmbedGenerator(Becca, "weekly", errorId)],
    });
  }
};
