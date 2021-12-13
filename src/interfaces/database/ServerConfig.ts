/* eslint-disable camelcase */
import { Document } from "mongoose";

import { LevelRole } from "../settings/LevelRole";

export interface ServerConfig extends Document {
  serverID: string;
  serverName: string;
  levels: string;
  welcome_channel: string;
  depart_channel: string;
  level_channel: string;
  suggestion_channel: string;
  muted_role: string;
  custom_welcome: string;
  hearts: string[];
  blocked: string[];
  self_roles: string[];
  triggers: [string, string][];
  automod_channels: string[];
  no_automod_channels: string[];
  automod_roles: string[];
  allowed_links: string[];
  link_message: string;
  level_roles: LevelRole[];
  join_role: string;
  leave_message: string;
  report_channel: string;
  level_ignore: string[];
  sass_mode: string;
  message_events: string;
  voice_events: string;
  thread_events: string;
  moderation_events: string;
  member_events: string;
  links: string;
  profanity: string;
  profanity_message: string;
  emote_channels: string[];
}

export const testServerConfig: Omit<ServerConfig, keyof Document> = {
  serverID: "",
  serverName: "",
  levels: "",
  welcome_channel: "",
  depart_channel: "",
  level_channel: "",
  suggestion_channel: "",
  muted_role: "",
  custom_welcome: "",
  hearts: [],
  blocked: [],
  self_roles: [],
  triggers: [],
  automod_channels: [],
  no_automod_channels: [],
  automod_roles: [],
  allowed_links: [],
  link_message: "",
  level_roles: [],
  join_role: "",
  leave_message: "",
  report_channel: "",
  level_ignore: [],
  sass_mode: "",
  message_events: "",
  voice_events: "",
  thread_events: "",
  moderation_events: "",
  member_events: "",
  links: "",
  profanity: "",
  profanity_message: "",
  emote_channels: [],
};
