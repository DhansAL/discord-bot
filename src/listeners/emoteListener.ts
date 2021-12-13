/* eslint-disable jsdoc/require-jsdoc */
import { Listener } from "../interfaces/listeners/Listener";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";

export const emoteListener: Listener = {
  name: "emoteListener",
  description: "Handles the logic for emote-only channels.",
  run: async (Becca, message, config) => {
    try {
      if (!config.emote_channels?.includes(message.channel.id)) {
        return;
      }

      if (!message.content) {
        await message.delete();
        return;
      }

      if (message.attachments.size > 0) {
        await message.delete();
        return;
      }

      const newContent = message.content
        // Discord emote syntax
        ?.replace(/:[^:\s]+:|<:[^:\s]+:[0-9]+>|<a:[^:\s]+:[0-9]+>/g, "")
        // standard emotes
        .replace(
          /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\ufe0f)/g,
          ""
        )
        .replace(/\s/g, "");

      console.log(newContent);

      if (newContent?.length) {
        await message.delete();
        return;
      }
    } catch (err) {
      await beccaErrorHandler(
        Becca,
        "trigger listener",
        err,
        message.guild?.name,
        message
      );
    }
  },
};
