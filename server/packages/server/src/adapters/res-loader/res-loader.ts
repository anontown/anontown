import * as DataLoader from "dataloader";
import { Res } from "../../entities/index";
import {
  IAuthContainer,
  IResLoader,
  IResRepo,
  ResQuery,
} from "../../ports/index";
import { loader } from "../loader-helper";

export class ResLoader implements IResLoader {
  loader: DataLoader<string, Res>;

  constructor(resRepo: IResRepo, auth: IAuthContainer) {
    this.loader = loader(ids =>
      resRepo.find(auth, { ...ResQuery, id: ids }, ids.length),
    );
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: Array<string>) {
    return this.loader.loadMany(ids);
  }
}
