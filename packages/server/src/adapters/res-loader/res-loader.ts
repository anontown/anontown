import * as DataLoader from "dataloader";
import { Res } from "../../entities/index";
import { IResLoader, IResRepo } from "../../ports/index";
import { AuthContainer } from "../../server/auth-container";
import { loader } from "../loader-helper";

export class ResLoader implements IResLoader {
  loader: DataLoader<string, Res>;

  constructor(resRepo: IResRepo, auth: AuthContainer) {
    this.loader = loader(ids => resRepo.find(auth, { id: ids }, ids.length));
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: string[]) {
    return this.loader.loadMany(ids);
  }
}
