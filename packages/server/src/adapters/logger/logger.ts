import { logger } from "../../logger";
import { ILogger } from "../../ports";

export class Logger implements ILogger {
  error(msg: string) {
    logger.error(msg);
  }
  warn(msg: string) {
    logger.warn(msg);
  }
  info(msg: string) {
    logger.info(msg);
  }
  verbose(msg: string) {
    logger.verbose(msg);
  }
  debug(msg: string) {
    logger.debug(msg);
  }
  silly(msg: string) {
    logger.silly(msg);
  }
}
