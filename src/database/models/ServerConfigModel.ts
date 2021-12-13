/* eslint-disable camelcase */
import { model, Schema } from "mongoose";

import { ServerConfig } from "../../interfaces/database/ServerConfig";

export const ServerConfigSchema = new Schema({
  serverID: String,
  serverName: String,
  levels: String,
  welcome_channel: String,
  depart_channel: String,
  level_channel: String,
  suggestion_channel: {
    type: String,
    default: "",
  },
  muted_role: String,
  custom_welcome: String,
  hearts: [String],
  blocked: [String],
  self_roles: [String],
  level_roles: [Object],
  join_role: String,
  leave_message: String,
  report_channel: String,
  level_ignore: [String],
  sass_mode: String,
  triggers: Array,
  emote_channels: Array,
  // automod
  automod_channels: [String],
  no_automod_channels: [String],
  automod_roles: [String],
  allowed_links: [String],
  link_message: String,
  profanity_message: String,
  links: String,
  profanity: String,
  // logging
  message_events: String,
  voice_events: String,
  thread_events: String,
  moderation_events: String,
  member_events: String,
});

export default model<ServerConfig>("server", ServerConfigSchema);
