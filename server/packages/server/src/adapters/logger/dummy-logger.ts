import { ILogger } from "../../ports";

export class DummyLogger implements ILogger {
  error(msg: string) {
    console.error("[DummyLogger#error]", msg);
  }
  warn(msg: string) {
    console.warn("[DummyLogger#warn]", msg);
  }
  info(msg: string) {
    console.log("[DummyLogger#info]", msg);
  }
  verbose(msg: string) {
    console.log("[DummyLogger#verbose]", msg);
  }
  debug(msg: string) {
    console.log("[DummyLogger#debug]", msg);
  }
  silly(msg: string) {
    console.log("[DummyLogger#silly]", msg);
  }
}
