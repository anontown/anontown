import { ObjectID } from "mongodb";
import { IObjectIdGenerator } from "../../ports";

export class ObjectIdGenerator implements IObjectIdGenerator {
  generateObjectId(): string {
    return new ObjectID().toString();
  }
}
