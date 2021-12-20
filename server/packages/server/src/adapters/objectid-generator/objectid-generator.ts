import { ObjectID } from "bson";
import { IObjectIdGenerator } from "../../ports";

export class ObjectIdGenerator implements IObjectIdGenerator {
  generateObjectId(): string {
    return new ObjectID().toString();
  }
}
