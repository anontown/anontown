import { isNullish } from "@kgtkr/utils";
import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { ObjectID } from "mongodb";
import { AtAuthError, AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster } from "../../auth";
import { Mongo } from "../../db";
import { Client } from "../../entities";
import * as G from "../../generated/graphql";
import { IClientRepo } from "../../ports";
import { fromClient, IClientDB, toClient } from "./iclient-db";

export class ClientRepo implements IClientRepo {
  async findOne(id: string): Promise<Client> {
    const db = await Mongo();
    const client: IClientDB | null = await db
      .collection("clients")
      .findOne({ _id: new ObjectID(id) });

    if (client === null) {
      throw new AtNotFoundError("クライアントが存在しません");
    }
    return toClient(client);
  }

  async find(
    authToken: Option<IAuthTokenMaster>,
    query: G.ClientQuery,
  ): Promise<Array<Client>> {
    if (query.self && option.isNone(authToken)) {
      throw new AtAuthError("認証が必要です");
    }
    const db = await Mongo();
    const q: any = {};
    if (query.self && option.isSome(authToken)) {
      q.user = new ObjectID(authToken.value.user);
    }
    if (!isNullish(query.id)) {
      q._id = { $in: query.id.map(id => new ObjectID(id)) };
    }
    const clients: Array<IClientDB> = await db
      .collection("clients")
      .find(q)
      .sort({ date: -1 })
      .toArray();
    return clients.map(c => toClient(c));
  }

  async insert(client: Client): Promise<void> {
    const db = await Mongo();

    await db.collection("clients").insertOne(fromClient(client));
  }

  async update(client: Client): Promise<void> {
    const db = await Mongo();
    await db
      .collection("clients")
      .replaceOne({ _id: new ObjectID(client.id) }, fromClient(client));
  }
}
