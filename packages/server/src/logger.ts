import * as log4js from "log4js";
import * as path from "path";
import { Config } from "./config";
import * as winston from "winston";

function createFormatter(label: string) {
  return winston.format.combine(
    winston.format.label({ label }),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    }),
  );
}

const logger = winston.createLogger({
  level: "debug",
  format: createFormatter("app"),
  transports: [
    new winston.transports.File({ filename: "logs/app.log", level: "info" }),
    new winston.transports.Console({ level: "debug" }),
  ],
});

// log
log4js.configure({
  appenders: {
    default: {
      type: "dateFile",
      filename: path.join(Config.saveDir, "logs/default.log"),
      pattern: "-yyyy-MM-dd",
    },
    system: {
      type: "dateFile",
      filename: path.join(Config.saveDir, "logs/system.log"),
      pattern: "-yyyy-MM-dd",
    },
    access: {
      type: "dateFile",
      filename: path.join(Config.saveDir, "logs/access.log"),
      pattern: "-yyyy-MM-dd",
    },
    error: {
      type: "dateFile",
      filename: path.join(Config.saveDir, "logs/error.log"),
      pattern: "-yyyy-MM-dd",
    },
    app: {
      type: "dateFile",
      filename: path.join(Config.saveDir, "logs/app.log"),
      pattern: "-yyyy-MM-dd",
    },
  },
  categories: {
    default: { appenders: ["default"], level: "info" },
    system: { appenders: ["system"], level: "info" },
    access: { appenders: ["access"], level: "info" },
    error: { appenders: ["error"], level: "info" },
    app: { appenders: ["app"], level: "info" },
  },
});

export class Logger {
  static system = log4js.getLogger("system");
  static access = log4js.getLogger("access");
  static error = log4js.getLogger("error");
  static app = log4js.getLogger("app");
  static express = log4js.connectLogger(log4js.getLogger("access"), {
    level: "info",
  });
}
