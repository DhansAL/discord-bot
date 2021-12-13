import { ArraySettings } from "../../interfaces/settings/ArraySettings";
import {
  AutomodSettings,
  AutomodToggleSettings,
} from "../../interfaces/settings/AutomodSettings";
import { LogSettings } from "../../interfaces/settings/LogSettings";
import { Settings } from "../../interfaces/settings/Settings";

export const configChoices: [string, Settings][] = [
  ["Level System", "levels"],
  ["Welcome Message Channel", "welcome_channel"],
  ["Departure Message Channel", "depart_channel"],
  ["Level Log Channel", "level_channel"],
  ["Suggestion Channel", "suggestion_channel"],
  ["Muted Role", "muted_role"],
  ["Custom Welcome Message", "custom_welcome"],
  ["Heart Users", "hearts"],
  ["Blocked Users", "blocked"],
  ["Self-assignable Roles", "self_roles"],
  ["Level-assigned Roles", "level_roles"],
  ["Role on Join", "join_role"],
  ["Custom Leave Message", "leave_message"],
  ["Report Channel", "report_channel"],
  ["No Levelling Channels", "level_ignore"],
  ["Sass Mode", "sass_mode"],
  ["Emote-Only Channels", "emote_channels"],
];

export const configViewChoices: [string, ArraySettings | "global"][] = [
  ["Global Settings", "global"],
  // global must be on top for tests to pass
  ["Heart Users", "hearts"],
  ["Self-Assignable Roles", "self_roles"],
  ["Blocked Users", "blocked"],
  ["Level-assigned Roles", "level_roles"],
  ["No Levelling Channels", "level_ignore"],
  ["Emote-Only Channels", "emote_channels"],
];

export const logChoices: [string, LogSettings][] = [
  ["Message Events (edit, delete)", "message_events"],
  ["Voice Events (join, disconnect, mute, deafen)", "voice_events"],
  ["Thread Events (create, archive, delete)", "thread_events"],
  ["Moderation Activity (kick, ban, mute)", "moderation_events"],
  ["Member Events (screening, updates)", "member_events"],
];

export const automodChoices: [string, AutomodSettings][] = [
  ["Automodded Channels", "automod_channels"],
  ["Automod Ignored Channels", "no_automod_channels"],
  ["Automod Exempt Roles", "automod_roles"],
  ["Allowed Link Regex", "allowed_links"],
  ["Link Delete Message", "link_message"],
  ["Profanity Delete Message", "profanity_message"],
];

export const automodViewChoices: [string, ArraySettings | "global"][] = [
  ["Global Automod Settings", "global"],
  // global must be on top for tests to pass
  ["Automodded Channels", "automod_channels"],
  ["Automod Ignored Channels", "no_automod_channels"],
  ["Automod Exempt Roles", "automod_roles"],
  ["Allowed Link Regex", "allowed_links"],
];

export const automodToggleChoices: [string, AutomodToggleSettings][] = [
  ["Link Detection", "links"],
  ["Profanity Detection", "profanity"],
];
