import * as path from "path";
import * as winston from "winston";
import { Config } from "./config";

function createFormatter(label: string) {
  return winston.format.combine(
    winston.format.label({ label }),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, label, timestamp }) => {
      return `${timestamp} [${label}] ${level}: ${message}`;
    }),
  );
}

export const logger = winston.createLogger({
  level: "debug",
  format: createFormatter("app"),
  transports: [new winston.transports.Console({ level: "debug" })],
});
