import { isNullish } from "@kgtkr/utils";
import { option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { AtNotFoundError } from "../../at-error";
import { IAuthToken } from "../../auth";
import { Storage } from "../../entities";
import * as G from "../../generated/graphql";
import { IStorageRepo } from "../../ports";
import { fromStorage, IStorageDB, toStorage } from "./isotrage-db";

export class StorageRepoMock implements IStorageRepo {
  private storages: Array<IStorageDB> = [];

  async find(
    token: IAuthToken,
    query: G.StorageQuery,
  ): Promise<Array<Storage>> {
    const storages = this.storages
      .filter(
        x =>
          x.user.toHexString() === token.user &&
          (x.client !== null ? x.client.toHexString() : null) ===
            (token.type === "general" ? token.client : null),
      )
      .filter(x => isNullish(query.key) || query.key.includes(x.key));

    return storages.map(x => toStorage(x));
  }

  async findOneKey(token: IAuthToken, key: string): Promise<Storage> {
    const storage = this.storages.find(
      x =>
        x.user.toHexString() === token.user &&
        (x.client !== null ? x.client.toHexString() : null) ===
          (token.type === "general" ? token.client : null) &&
        x.key === key,
    );

    if (storage === undefined) {
      throw new AtNotFoundError("ストレージが見つかりません");
    }
    return toStorage(storage);
  }
  async save(storage: Storage): Promise<void> {
    const index = this.storages.findIndex(
      x =>
        x.user.toHexString() === storage.user &&
        (x.client !== null ? x.client.toHexString() : null) ===
          pipe(storage.client, option.toNullable) &&
        x.key === storage.key,
    );
    if (index === -1) {
      this.storages.push(fromStorage(storage));
    } else {
      this.storages[index] = fromStorage(storage);
    }
  }
  async del(storage: Storage): Promise<void> {
    const index = this.storages.findIndex(
      x =>
        x.user.toHexString() === storage.user &&
        (x.client !== null ? x.client.toHexString() : null) ===
          pipe(storage.client, option.toNullable) &&
        x.key === storage.key,
    );
    this.storages.splice(index, 1);
  }
}
