import { isNullish } from "@kgtkr/utils";
import { ObjectID, WriteError } from "mongodb";
import { AtConflictError, AtNotFoundError } from "../../at-error";
import { Mongo } from "../../db";
import { IProfileDB, Profile } from "../../entities";
import * as G from "../../generated/graphql";
import { IProfileRepo } from "../../ports";
import { AuthContainer } from "../../server/auth-container";

export class ProfileRepo implements IProfileRepo {
  async findOne(id: string): Promise<Profile> {
    const db = await Mongo();
    const profile: IProfileDB | null = await db
      .collection("profiles")
      .findOne({ _id: new ObjectID(id) });

    if (profile === null) {
      throw new AtNotFoundError("プロフィールが存在しません");
    }

    return Profile.fromDB(profile);
  }

  async find(auth: AuthContainer, query: G.ProfileQuery): Promise<Profile[]> {
    const q: any = {};
    if (query.self) {
      q.user = new ObjectID(auth.token.user);
    }
    if (!isNullish(query.id)) {
      q._id = { $in: query.id.map(x => new ObjectID(x)) };
    }
    const db = await Mongo();
    const profiles: IProfileDB[] = await db
      .collection("profiles")
      .find(q)
      .sort({ date: -1 })
      .toArray();
    return profiles.map(p => Profile.fromDB(p));
  }

  async insert(profile: Profile): Promise<void> {
    const db = await Mongo();
    try {
      await db.collection("profiles").insertOne(profile.toDB());
    } catch (ex) {
      const e: WriteError = ex;
      if (e.code === 11000) {
        throw new AtConflictError("スクリーンネームが使われています");
      } else {
        throw e;
      }
    }
  }

  async update(profile: Profile): Promise<void> {
    const db = await Mongo();
    try {
      await db
        .collection("profiles")
        .replaceOne({ _id: new ObjectID(profile.id) }, profile.toDB());
    } catch (ex) {
      const e: WriteError = ex;
      if (e.code === 11000) {
        throw new AtConflictError("スクリーンネームが使われています");
      } else {
        throw e;
      }
    }
  }
}
