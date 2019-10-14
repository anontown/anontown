export interface ILogger {
  error(msg: string): void;
  warn(msg: string): void;
  info(msg: string): void;
  verbose(msg: string): void;
  debug(msg: string): void;
  silly(msg: string): void;
}
