import * as winston from "winston";

function createFormatter(label: string) {
  return winston.format.combine(
    winston.format.label({ label }),
    winston.format.timestamp(),
    winston.format.printf(({ level, message, label, timestamp }) => {
      // TODO: disableしない
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `${timestamp} [${label}] ${level}: ${message}`;
    }),
  );
}

export const logger = winston.createLogger({
  level: "debug",
  format: createFormatter("app"),
  transports: [new winston.transports.Console({ level: "debug" })],
});
