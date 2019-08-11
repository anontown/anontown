import { ObjectID } from "mongodb";
import { Storage } from "../../entities";
import { fromNullable } from "fp-ts/lib/Option";

export interface IStorageDB {
  client: ObjectID | null;
  user: ObjectID;
  key: string;
  value: string;
}

export function toStorage(db: IStorageDB): Storage {
  return new Storage(
    fromNullable(db.client).map(client => client.toHexString()),
    db.user.toHexString(),
    db.key,
    db.value,
  );
}

export function fromStorage(storage: Storage): IStorageDB {
  return {
    client: storage.client.map(client => new ObjectID(client)).toNullable(),
    user: new ObjectID(storage.user),
    key: storage.key,
    value: storage.value,
  };
}
