import io from "@pm2/io";

import { BeccaLyria } from "../interfaces/BeccaLyria";
import { beccaLogHandler } from "../utils/beccaLogHandler";

/**
 * Module to load the PM2 config and attach it to Becca.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @returns {boolean} True if PM2 configs were mounted successfully.
 */
export const loadPM2 = (Becca: BeccaLyria): boolean => {
  try {
    Becca.pm2 = {
      client: io,
      metrics: {
        events: io.meter({ name: "Gateway Events Received", id: "events" }),
        commands: io.meter({ name: "Commands Received", id: "commands" }),
        errors: io.meter({ name: "Errors Triggered", id: "errors" }),
        guilds: io.gauge({ name: "Guild Count", id: "guilds" }),
        users: io.gauge({ name: "User Count", id: "users" }),
      },
    };
    io.init();
    return true;
  } catch (err) {
    beccaLogHandler.log("error", err);
    return false;
  }
};
