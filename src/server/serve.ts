import { readFile } from "fs/promises";
import http from "http";
import https from "https";

import * as Topgg from "@top-gg/sdk";
import cors from "cors";
import express from "express";

import { VoteOptOut } from "../config/optout/VoteOptOut";
import CommandCountModel from "../database/models/CommandCountModel";
import LevelModel from "../database/models/LevelModel";
import StarModel from "../database/models/StarModel";
import UsageModel from "../database/models/UsageModel";
import VoterModel from "../database/models/VoterModel";
import { BeccaLyria } from "../interfaces/BeccaLyria";
import { getCounts } from "../modules/becca/getCounts";
import { sendVoteMessage } from "../modules/server/sendVoteMessage";
import { sendVoteReminder } from "../modules/server/sendVoteReminder";
import { beccaErrorHandler } from "../utils/beccaErrorHandler";
import { beccaLogHandler } from "../utils/beccaLogHandler";

/**
 * Spins up a basic web server for uptime monitoring.
 *
 * @param {BeccaLyria} Becca Becca's Discord instance.
 * @returns {boolean} True if the server was started, false if it crashed.
 */
export const createServer = async (Becca: BeccaLyria): Promise<boolean> => {
  try {
    const HTTPEndpoint = express();
    const topgg = new Topgg.Webhook(Becca.configs.topGG, {});
    HTTPEndpoint.disable("x-powered-by");

    const allowedOrigins = [
      "https://dash.beccalyria.com",
      "http://localhost:4200",
    ];

    HTTPEndpoint.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
      })
    );

    HTTPEndpoint.post(
      "/votes",
      topgg.listener(async (payload) => {
        if (VoteOptOut.includes(payload.user)) {
          return;
        }
        let voteType: "bot" | "server" | "unknown" = "unknown";
        const voteRecord =
          (await VoterModel.findOne({ userId: payload.user })) ||
          (await VoterModel.create({
            userId: payload.user,
            serverVotes: 0,
            botVotes: 0,
          }));

        if (payload.bot === Becca.configs.id) {
          voteRecord.botVotes = voteRecord.botVotes + 1;
          voteType = "bot";
        }
        if (payload.bot === Becca.configs.id && payload.isWeekend) {
          voteRecord.botVotes = voteRecord.botVotes + 1;
          voteType = "bot";
        }
        if (payload.guild === Becca.configs.homeGuild) {
          voteRecord.serverVotes = voteRecord.serverVotes + 1;
          voteType = "server";
        }

        await voteRecord.save();

        await sendVoteMessage(Becca, payload, voteRecord, voteType);
        setTimeout(
          async () =>
            await sendVoteReminder(Becca, payload, voteRecord, voteType),
          1000 * 60 * 60 * 12
        );
      })
    );

    HTTPEndpoint.use("/stats/:stat", async (req, res) => {
      switch (req.params.stat) {
        case "commands":
          // eslint-disable-next-line no-case-declarations
          const data = await CommandCountModel.find({})
            .sort({ commandUses: -1 })
            .lean();
          res.json(data);
          break;
        default:
          res.status(404).send("Invalid stat view!");
      }
    });

    HTTPEndpoint.use("/leaderboard/:serverId", async (req, res) => {
      const data = await LevelModel.find(
        { serverID: req.params.serverId },
        { _id: 0, __v: 0 }
      );

      if (!data) {
        res.status(404).send("IDK what to put here yet.");
        return;
      }
      res.json(data);
    });

    HTTPEndpoint.use("/stars/:serverId", async (req, res) => {
      const data = await StarModel.findOne(
        { serverID: req.params.serverId },
        { _id: 0, __v: 0 }
      );

      if (!data) {
        res.status(404).send("IDK what to put here yet.");
        return;
      }
      res.json(data);
    });

    HTTPEndpoint.use("/commands", async (_, res) => {
      const data = await UsageModel.find();
      res.json(data);
    });

    HTTPEndpoint.use("/about", (_, res) => {
      const data = getCounts(Becca);
      res.json(data);
    });

    HTTPEndpoint.use("/", (_, res) => {
      res.status(200).send("Ping!");
    });

    const httpPort = 1080;

    const httpServer = http.createServer(HTTPEndpoint);

    httpServer.listen(httpPort, () => {
      beccaLogHandler.log("http", `http server is live on port ${httpPort}`);
    });

    if (process.env.NODE_ENV === "production") {
      const privateKey = await readFile(
        "/etc/letsencrypt/live/bot.beccalyria.com/privkey.pem",
        "utf8"
      );
      const certificate = await readFile(
        "/etc/letsencrypt/live/bot.beccalyria.com/cert.pem",
        "utf8"
      );
      const ca = await readFile(
        "/etc/letsencrypt/live/bot.beccalyria.com/chain.pem",
        "utf8"
      );

      const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
      };

      const httpsServer = https.createServer(credentials, HTTPEndpoint);
      httpsServer.listen(1443, () => {
        beccaLogHandler.log("http", "https server is live on port 443");
      });
    }
    return true;
  } catch (err) {
    await beccaErrorHandler(Becca, "create server", err);
    return false;
  }
};
