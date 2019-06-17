import { isNullish } from "@kgtkr/utils";
import { Option } from "fp-ts/lib/Option";
import { ObjectID } from "mongodb";
import { AtAuthError, AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster } from "../../auth";
import { Mongo } from "../../db";
import { Client, IClientDB } from "../../entities";
import * as G from "../../generated/graphql";
import { IClientRepo } from "../../ports";

export class ClientRepo implements IClientRepo {
  async findOne(id: string): Promise<Client> {
    const db = await Mongo();
    const client: IClientDB | null = await db
      .collection("clients")
      .findOne({ _id: new ObjectID(id) });

    if (client === null) {
      throw new AtNotFoundError("クライアントが存在しません");
    }
    return Client.fromDB(client);
  }

  async find(
    authToken: Option<IAuthTokenMaster>,
    query: G.ClientQuery,
  ): Promise<Client[]> {
    if (query.self && authToken.isNone()) {
      throw new AtAuthError("認証が必要です");
    }
    const db = await Mongo();
    const q: any = {};
    if (query.self && authToken.isSome()) {
      q.user = new ObjectID(authToken.value.user);
    }
    if (!isNullish(query.id)) {
      q._id = { $in: query.id.map(id => new ObjectID(id)) };
    }
    const clients: IClientDB[] = await db
      .collection("clients")
      .find(q)
      .sort({ date: -1 })
      .toArray();
    return clients.map(c => Client.fromDB(c));
  }

  async insert(client: Client): Promise<void> {
    const db = await Mongo();

    await db.collection("clients").insertOne(client.toDB());
  }

  async update(client: Client): Promise<void> {
    const db = await Mongo();
    await db
      .collection("clients")
      .replaceOne({ _id: new ObjectID(client.id) }, client.toDB());
  }
}
