import { ObjectID, WriteError } from "mongodb";
import { AtConflictError, AtNotFoundError } from "../../at-error";
import { Mongo } from "../../db";
import { ResWaitCountKey, User } from "../../entities";
import { IUserRepo } from "../../ports";
import { fromUser, IUserDB, toUser } from "./iuser-db";

export class UserRepo implements IUserRepo {
  async findOne(id: string): Promise<User> {
    const db = await Mongo();
    const user: IUserDB | null = await db
      .collection("users")
      .findOne({ _id: new ObjectID(id) });

    if (user === null) {
      throw new AtNotFoundError("ユーザーが存在しません");
    }

    return toUser(user);
  }

  async findID(sn: string): Promise<string> {
    const db = await Mongo();
    const user: IUserDB | null = await db.collection("users").findOne({ sn });

    if (user === null) {
      throw new AtNotFoundError("ユーザーが存在しません");
    }

    return user._id.toHexString();
  }

  async insert(user: User): Promise<void> {
    const db = await Mongo();
    try {
      await db.collection("users").insertOne(fromUser(user));
    } catch (ex) {
      const e: WriteError = ex;
      if (e.code === 11000) {
        throw new AtConflictError("スクリーンネームが使われています");
      } else {
        throw e;
      }
    }
  }

  async update(user: User): Promise<void> {
    const db = await Mongo();
    try {
      await db
        .collection("users")
        .replaceOne({ _id: new ObjectID(user.id) }, fromUser(user));
    } catch (ex) {
      const e: WriteError = ex;
      if (e.code === 11000) {
        throw new AtConflictError("スクリーンネームが使われています");
      } else {
        throw e;
      }
    }
  }

  async cronPointReset(): Promise<void> {
    const db = await Mongo();
    await db.collection("users").updateMany({}, { $set: { point: 0 } });
  }

  async cronCountReset(key: ResWaitCountKey): Promise<void> {
    const db = await Mongo();
    await db
      .collection("users")
      .updateMany({}, { $set: { ["resWait." + key]: 0 } });
  }
}
