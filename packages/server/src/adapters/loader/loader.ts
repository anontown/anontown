import * as DataLoader from "dataloader";
import { Client, History, Msg, Profile, Res, Topic } from "../../entities";
import {
  IClientRepo,
  IHistoryRepo,
  ILoader,
  IMsgRepo,
  IProfileRepo,
  IResRepo,
  ITopicRepo,
} from "../../ports";
import { AuthContainer } from "../../server/auth-container";
import { loader } from "../loader-helper";

export class Loader implements ILoader {
  client: DataLoader<string, Client>;
  history: DataLoader<string, History>;
  msg: DataLoader<string, Msg>;
  profile: DataLoader<string, Profile>;
  res: DataLoader<string, Res>;
  topic: DataLoader<string, Topic>;

  constructor(ports: {
    auth: AuthContainer;
    clientRepo: IClientRepo;
    hisotryRepo: IHistoryRepo;
    msgRepo: IMsgRepo;
    profileRepo: IProfileRepo;
    resRepo: IResRepo;
    topicRepo: ITopicRepo;
  }) {
    this.client = loader(ids =>
      ports.clientRepo.find(ports.auth.TokenMasterOrNull, { id: ids }),
    );
    this.history = loader(ids =>
      ports.hisotryRepo.find({ id: ids }, ids.length),
    );
    this.msg = loader(ids =>
      ports.msgRepo.find(ports.auth.token, { id: ids }, ids.length),
    );
    this.profile = loader(ids =>
      ports.profileRepo.find(ports.auth, { id: ids }),
    );
    this.res = loader(ids =>
      ports.resRepo.find(ports.auth, { id: ids }, ids.length),
    );
    this.topic = loader(ids =>
      ports.topicRepo.find({ id: ids }, 0, ids.length),
    );
  }
}
