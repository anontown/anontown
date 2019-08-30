import * as DataLoader from "dataloader";
import { Msg } from "../../entities/index";
import { IMsgRepo } from "../../ports/index";
import { IMsgLoader } from "../../ports/msg-loader/msg-loader";
import { AuthContainer } from "../../server/auth-container";
import { loader } from "../loader-helper";

export class MsgLoader implements IMsgLoader {
  loader: DataLoader<string, Msg>;

  constructor(msgRepo: IMsgRepo, auth: AuthContainer) {
    this.loader = loader(ids =>
      msgRepo.find(auth.token, { id: ids }, ids.length),
    );
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: string[]) {
    return this.loader.loadMany(ids);
  }
}
