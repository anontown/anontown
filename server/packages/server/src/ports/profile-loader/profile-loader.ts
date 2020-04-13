import { Profile } from "../../entities/index";

export interface IProfileLoader {
  load(id: string): Promise<Profile>;
  loadMany(ids: Array<string>): Promise<Array<Profile>>;
}
