import { ISafeIdGenerator } from "../../ports";

export class DummySafeIdGenerator implements ISafeIdGenerator {
  constructor(private safeid: string) {}

  generateSafeId(): string {
    return this.safeid;
  }
}
