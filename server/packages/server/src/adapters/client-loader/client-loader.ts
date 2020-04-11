import * as DataLoader from "dataloader";
import { Client } from "../../entities/index";
import { IAuthContainer, IClientLoader, IClientRepo } from "../../ports/index";
import { loader } from "../loader-helper";

export class ClientLoader implements IClientLoader {
  loader: DataLoader<string, Client>;

  constructor(clientRepo: IClientRepo, auth: IAuthContainer) {
    this.loader = loader(ids =>
      clientRepo.find(auth.getTokenMasterOrNull(), { id: ids }),
    );
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: Array<string>) {
    return this.loader.loadMany(ids);
  }
}
