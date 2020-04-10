import { isNullish } from "@kgtkr/utils";
import { ObjectID, WriteError } from "mongodb";
import { AtConflictError, AtNotFoundError } from "../../at-error";
import { Mongo } from "../../db";
import { Profile } from "../../entities";
import * as G from "../../generated/graphql";
import { IAuthContainer, IProfileRepo } from "../../ports";
import { fromProfile, IProfileDB, toProfile } from "./jprofile-db";

export class ProfileRepo implements IProfileRepo {
  async findOne(id: string): Promise<Profile> {
    const db = await Mongo();
    const profile: IProfileDB | null = await db
      .collection("profiles")
      .findOne({ _id: new ObjectID(id) });

    if (profile === null) {
      throw new AtNotFoundError("プロフィールが存在しません");
    }

    return toProfile(profile);
  }

  async find(
    auth: IAuthContainer,
    query: G.ProfileQuery,
  ): Promise<Array<Profile>> {
    const q: any = {};
    if (query.self) {
      q.user = new ObjectID(auth.getToken().user);
    }
    if (!isNullish(query.id)) {
      q._id = { $in: query.id.map(x => new ObjectID(x)) };
    }
    const db = await Mongo();
    const profiles: Array<IProfileDB> = await db
      .collection("profiles")
      .find(q)
      .sort({ date: -1 })
      .toArray();
    return profiles.map(p => toProfile(p));
  }

  async insert(profile: Profile): Promise<void> {
    const db = await Mongo();
    try {
      await db.collection("profiles").insertOne(fromProfile(profile));
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
        .replaceOne({ _id: new ObjectID(profile.id) }, fromProfile(profile));
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
