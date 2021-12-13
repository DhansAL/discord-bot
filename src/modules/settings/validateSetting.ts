/* eslint-disable no-case-declarations */
import { Guild } from "discord.js";

import { BeccaLyria } from "../../interfaces/BeccaLyria";
import { ServerConfig } from "../../interfaces/database/ServerConfig";
import { Settings } from "../../interfaces/settings/Settings";
import { beccaErrorHandler } from "../../utils/beccaErrorHandler";

/**
 * Validates that a setting is in the correct format. Confirms that channels exist,
 * members are in the server, etc.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @param {Settings} setting The name of the setting to validate.
 * @param {string} value The value to confirm is valid.
 * @param {Guild} guild The guild object to modify the settings for.
 * @param {ServerConfig} config The server config object from the database.
 * @returns {boolean} True if the setting is valid, false if not.
 */
export const validateSetting = async (
  Becca: BeccaLyria,
  setting: Settings,
  value: string,
  guild: Guild,
  config: ServerConfig
): Promise<boolean> => {
  try {
    const parsedValue = BigInt(value.replace(/\D/g, ""));
    switch (setting) {
      case "levels":
      case "sass_mode":
      case "links":
      case "profanity":
        return value === "on" || value === "off";
      case "hearts":
      case "blocked":
        return (
          !!parsedValue &&
          !!(
            (await guild.members.fetch(`${parsedValue}`)) ||
            config[setting].includes(`${parsedValue}`)
          )
        );
      case "muted_role":
      case "join_role":
        return !!parsedValue && !!(await guild.roles.fetch(`${parsedValue}`));
      case "self_roles":
      case "automod_roles":
        return (
          !!parsedValue &&
          (!!(await guild.roles.fetch(`${parsedValue}`)) ||
            config[setting].includes(`${parsedValue}`))
        );
      case "welcome_channel":
      case "depart_channel":
      case "message_events":
      case "voice_events":
      case "thread_events":
      case "moderation_events":
      case "member_events":
      case "suggestion_channel":
      case "level_channel":
      case "report_channel":
      case "level_ignore":
        return !!guild.channels.cache.find(
          (el) => el.type === "GUILD_TEXT" && el.id === `${parsedValue}`
        );
      case "automod_channels":
      case "no_automod_channels":
      case "emote_channels":
        return (
          !!guild.channels.cache.find(
            (el) => el.type === "GUILD_TEXT" && el.id === `${parsedValue}`
          ) ||
          config[setting].includes(`${parsedValue}`) ||
          value === "all"
        );
      case "level_roles":
        const [level, role] = value.split(" ");
        const parsedLevel = parseInt(level, 10);
        if (
          config[setting].find(
            (el) =>
              el.level === parsedLevel && el.role === role.replace(/\D/g, "")
          )
        ) {
          return true;
        }
        return (
          !isNaN(parsedLevel) &&
          parsedLevel >= 1 &&
          parsedLevel <= 100 &&
          !!role.replace(/\D/g, "") &&
          !!(await guild.roles.fetch(role.replace(/\D/g, "") as `${bigint}`))
        );
      case "allowed_links":
      case "custom_welcome":
      case "link_message":
      case "leave_message":
      case "profanity_message":
        return true;
      default:
        return false;
    }
  } catch (err) {
    await beccaErrorHandler(Becca, "validate setting module", err, guild.name);
    return false;
  }
};
