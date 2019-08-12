import { ObjectID } from "mongodb";
import { Client } from "../../entities";

export interface IClientDB {
  readonly _id: ObjectID;
  readonly name: string;
  readonly url: string;
  readonly user: ObjectID;
  readonly date: Date;
  readonly update: Date;
}

export function toClient(c: IClientDB): Client {
  return new Client(
    c._id.toString(),
    c.name,
    c.url,
    c.user.toString(),
    c.date,
    c.update,
  );
}

export function fromClient(client: Client): IClientDB {
  return {
    _id: new ObjectID(client.id),
    name: client.name,
    url: client.url,
    user: new ObjectID(client.user),
    date: client.date,
    update: client.update,
  };
}
