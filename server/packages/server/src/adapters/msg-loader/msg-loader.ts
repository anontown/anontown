import * as DataLoader from "dataloader";
import { Msg } from "../../entities/index";
import { IAuthContainer, IMsgRepo } from "../../ports/index";
import { IMsgLoader } from "../../ports/msg-loader/msg-loader";
import { loader } from "../loader-helper";

export class MsgLoader implements IMsgLoader {
  loader: DataLoader<string, Msg>;

  constructor(msgRepo: IMsgRepo, auth: IAuthContainer) {
    this.loader = loader(ids =>
      msgRepo.find(auth.getToken(), { id: ids }, ids.length),
    );
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: Array<string>) {
    return this.loader.loadMany(ids);
  }
}
