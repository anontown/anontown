import { IObjectIdGenerator } from "../../ports";

export class DummyObjectIdGenerator implements IObjectIdGenerator {
  constructor(private objectId: string) {}

  generateObjectId(): string {
    return this.objectId;
  }
}
