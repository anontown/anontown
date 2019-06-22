import { ObjectID } from "mongodb";
import { Profile } from "../../entities";

export interface IProfileDB {
  readonly _id: ObjectID;
  readonly user: ObjectID;
  readonly name: string;
  readonly text: string;
  readonly date: Date;
  readonly update: Date;
  readonly sn: string;
}

export function toProfile(p: IProfileDB): Profile {
  return new Profile(
    p._id.toString(),
    p.user.toString(),
    p.name,
    p.text,
    p.date,
    p.update,
    p.sn,
  );
}

export function fromProfile(profile: Profile): IProfileDB {
  return {
    _id: new ObjectID(profile.id),
    user: new ObjectID(profile.user),
    name: profile.name,
    text: profile.text,
    date: profile.date,
    update: profile.update,
    sn: profile.sn,
  };
}
