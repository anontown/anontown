import { isNullish } from "@kgtkr/utils";
import { ObjectID } from "mongodb";
import { AtNotFoundError } from "../../at-error";
import { IAuthToken } from "../../auth";
import { Mongo } from "../../db";
import { Storage } from "../../entities";
import * as G from "../../generated/graphql";
import { IStorageRepo } from "../../ports";
import { fromStorage, IStorageDB, toStorage } from "./isotrage-db";

export class StorageRepo implements IStorageRepo {
  async find(token: IAuthToken, query: G.StorageQuery): Promise<Storage[]> {
    const db = await Mongo();
    const q: any = {
      user: new ObjectID(token.user),
      client: token.type === "general" ? new ObjectID(token.client) : null,
    };
    if (!isNullish(query.key)) {
      q.key = { $in: query.key };
    }
    const storages: IStorageDB[] = await db
      .collection("storages")
      .find(q)
      .toArray();
    return storages.map(x => toStorage(x));
  }

  async findOneKey(token: IAuthToken, key: string): Promise<Storage> {
    const db = await Mongo();
    const storage: IStorageDB | null = await db.collection("storages").findOne({
      user: new ObjectID(token.user),
      client: token.type === "general" ? new ObjectID(token.client) : null,
      key,
    });
    if (storage === null) {
      throw new AtNotFoundError("ストレージが見つかりません");
    }
    return toStorage(storage);
  }
  async save(storage: Storage): Promise<void> {
    const db = await Mongo();

    await db.collection("storages").replaceOne(
      {
        user: new ObjectID(storage.user),
        client: storage.client.map(client => new ObjectID(client)).toNullable(),
        key: storage.key,
      },
      fromStorage(storage),
      { upsert: true },
    );
  }
  async del(storage: Storage): Promise<void> {
    const db = await Mongo();

    await db.collection("storages").deleteOne({
      user: new ObjectID(storage.user),
      client: storage.client.map(client => new ObjectID(client)).toNullable(),
      key: storage.key,
    });
  }
}