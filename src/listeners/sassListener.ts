/* eslint-disable jsdoc/require-jsdoc */
import { Listener } from "../interfaces/listeners/Listener";
import { sassAmirite } from "../modules/listeners/sass/sassAmirite";
import { sassGreeting } from "../modules/listeners/sass/sassGreeting";
import { sassSorry } from "../modules/listeners/sass/sassSorry";
import { sassThanks } from "../modules/listeners/sass/sassThanks";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";

export const sassListener: Listener = {
  name: "sass",
  description: "Handles Becca's Sassy Mode!",
  run: async (Becca, message, config) => {
    try {
      if (config.sass_mode !== "on" || !message.content) {
        return;
      }

      await sassGreeting(Becca, message, config);
      await sassAmirite(Becca, message, config);
      await sassSorry(Becca, message, config);
      await sassThanks(Becca, message, config);
    } catch (err) {
      await beccaErrorHandler(
        Becca,
        "Sass Mode listener",
        err,
        message.guild?.name,
        message
      );
    }
  },
};
