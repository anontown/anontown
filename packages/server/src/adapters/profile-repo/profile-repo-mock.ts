import { isNullish } from "@kgtkr/utils";
import { AtConflictError, AtNotFoundError } from "../../at-error";
import { Profile } from "../../entities";
import * as G from "../../generated/graphql";
import { IProfileRepo } from "../../ports";
import { AuthContainer } from "../../server/auth-container";
import { fromProfile, IProfileDB, toProfile } from "./jprofile-db";

export class ProfileRepoMock implements IProfileRepo {
  private profiles: IProfileDB[] = [];

  async findOne(id: string): Promise<Profile> {
    const profile = this.profiles.find(x => x._id.toHexString() === id);

    if (profile === undefined) {
      throw new AtNotFoundError("プロフィールが存在しません");
    }

    return toProfile(profile);
  }

  async find(auth: AuthContainer, query: G.ProfileQuery): Promise<Profile[]> {
    const self = query.self ? auth.getToken().user : null;
    const profiles = this.profiles
      .filter(x => self === null || x.user.toHexString() === self)
      .filter(
        x => isNullish(query.id) || query.id.includes(x._id.toHexString()),
      )
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());

    return profiles.map(p => toProfile(p));
  }

  async insert(profile: Profile): Promise<void> {
    if (this.profiles.findIndex(x => x.sn === profile.sn) !== -1) {
      throw new AtConflictError("スクリーンネームが使われています");
    }

    this.profiles.push(fromProfile(profile));
  }

  async update(profile: Profile): Promise<void> {
    if (
      this.profiles.findIndex(
        x => x.sn === profile.sn && x._id.toHexString() !== profile.id,
      ) !== -1
    ) {
      throw new AtConflictError("スクリーンネームが使われています");
    }

    this.profiles[
      this.profiles.findIndex(x => x._id.toHexString() === profile.id)
    ] = fromProfile(profile);
  }
}
