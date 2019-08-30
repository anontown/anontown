import * as DataLoader from "dataloader";
import { Profile } from "../../entities/index";
import { IProfileLoader, IProfileRepo } from "../../ports/index";
import { AuthContainer } from "../../server/auth-container";
import { loader } from "../loader-helper";

export class ProfileLoader implements IProfileLoader {
  loader: DataLoader<string, Profile>;

  constructor(profileRepo: IProfileRepo, auth: AuthContainer) {
    this.loader = loader(ids => profileRepo.find(auth, { id: ids }));
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: string[]) {
    return this.loader.loadMany(ids);
  }
}
