/* eslint-disable jsdoc/no-undefined-types */
import * as Sentry from "@sentry/node";
import {
  CommandInteraction,
  ContextMenuInteraction,
  Message,
  MessageEmbed,
} from "discord.js";
import { Types } from "mongoose";

import { BeccaLyria } from "../interfaces/BeccaLyria";

import { beccaLogHandler } from "./beccaLogHandler";
import { customSubstring } from "./customSubstring";

/**
 * Takes the error object generated within the code, passes it to Sentry and logs the
 * information in the console. Then, generates an error ID, builds an error embed, and sends
 * that to the debug hook. Finally, returns the error ID to be passed to the user if applicable.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {string} context The string explaining where this error was thrown.
 * @param {unknown} err The standard error object (generated in a catch statement).
 * @param {string | undefined} guild The name of the guild that triggered the issue.
 * @param {Message | undefined} message Optional message that triggered the issue.
 * @param { CommandInteraction | ContextMenuInteraction | undefined } interaction Optional interaction that triggered the issue.
 * @returns {Types.ObjectId} A unique ID for the error.
 */
export const beccaErrorHandler = async (
  Becca: BeccaLyria,
  context: string,
  err: unknown,
  guild?: string,
  message?: Message,
  interaction?: CommandInteraction | ContextMenuInteraction
): Promise<Types.ObjectId> => {
  if (Becca.pm2.metrics.errors) {
    Becca.pm2.metrics.errors.mark();
  }
  const error = err as Error;
  beccaLogHandler.log("error", `There was an error in the ${context}:`);
  beccaLogHandler.log(
    "error",
    JSON.stringify({ errorMessage: error.message, errorStack: error.stack })
  );

  Sentry.captureException(error);

  const errorId = new Types.ObjectId();
  const errorEmbed = new MessageEmbed();
  errorEmbed.setTitle(
    `${context} error ${guild ? "in " + guild : "from an unknown source"}.`
  );
  errorEmbed.setColor(Becca.colours.error);
  errorEmbed.setDescription(customSubstring(error.message, 2000));
  errorEmbed.addField(
    "Stack Trace:",
    `\`\`\`\n${customSubstring(error.stack || "null", 1000)}\n\`\`\``
  );
  errorEmbed.addField("Error ID", errorId.toHexString());
  errorEmbed.setTimestamp();
  if (message) {
    errorEmbed.addField(
      "Message Content:",
      customSubstring(message.content, 1000)
    );
  }

  if (interaction) {
    errorEmbed.addField(
      "Interaction Details",
      customSubstring(
        `${interaction.commandName} ${
          interaction.isCommand()
            ? interaction.options.getSubcommand() || ""
            : ""
        }`,
        1000
      )
    );
    errorEmbed.addField(
      "Interaction Options",
      customSubstring(
        interaction.options.data[0].options
          ?.map((o) => `\`${o.name}\`: ${o.value}`)
          .join(", ") || "no options",
        1000
      )
    );
  }
  await Becca.debugHook.send({ embeds: [errorEmbed] });

  return errorId;
};
