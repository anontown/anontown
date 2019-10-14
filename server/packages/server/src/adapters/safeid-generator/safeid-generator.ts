import nanoid = require("nanoid");
import { ISafeIdGenerator } from "../../ports";

export class SafeIdGenerator implements ISafeIdGenerator {
  generateSafeId(): string {
    return nanoid();
  }
}
