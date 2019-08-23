import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { logger } from "../../logger";
import { IIpContainer, ILogger } from "../../ports";

export class Logger implements ILogger {
  constructor(private ipContainer: IIpContainer) {}

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
  mutationLog(name: string, id: string) {
    logger.info(
      `${pipe(
        this.ipContainer.getIp(),
        option.getOrElse(() => "<unknown_ip>"),
      )} ${name} ${id}`,
    );
  }
}
