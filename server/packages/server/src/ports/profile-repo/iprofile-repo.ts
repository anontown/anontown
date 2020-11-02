import { Profile } from "../../entities";
import { IAuthContainer } from "../auth-container/index";

export interface ProfileQuery {
  id: Array<string> | null;
  self: boolean | null;
}

export const ProfileQuery: ProfileQuery = {
  id: null,
  self: null,
};

export interface IProfileRepo {
  findOne(id: string): Promise<Profile>;
  find(auth: IAuthContainer, query: ProfileQuery): Promise<Array<Profile>>;
  insert(profile: Profile): Promise<void>;
  update(profile: Profile): Promise<void>;
}
