import { Profile } from "../../entities";
import * as G from "../../generated/graphql";
import { IAuthContainer } from "../auth-container/index";

export interface IProfileRepo {
  findOne(id: string): Promise<Profile>;
  find(auth: IAuthContainer, query: G.ProfileQuery): Promise<Array<Profile>>;
  insert(profile: Profile): Promise<void>;
  update(profile: Profile): Promise<void>;
}
