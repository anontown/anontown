import { option } from "fp-ts";
import { fromNullable } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { ObjectID } from "mongodb";
import { Storage } from "../../entities";

export interface IStorageDB {
  client: ObjectID | null;
  user: ObjectID;
  key: string;
  value: string;
}

export function toStorage(db: IStorageDB): Storage {
  return new Storage(
    pipe(
      fromNullable(db.client),
      option.map(client => client.toHexString()),
    ),
    db.user.toHexString(),
    db.key,
    db.value,
  );
}

export function fromStorage(storage: Storage): IStorageDB {
  return {
    client: pipe(
      storage.client,
      option.map(client => new ObjectID(client)),
      option.toNullable,
    ),
    user: new ObjectID(storage.user),
    key: storage.key,
    value: storage.value,
  };
}
