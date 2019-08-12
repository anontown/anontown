import { IRepo } from "../ports";
import { ClientRepo } from "./client-repo";
import { HistoryRepo } from "./history-repo";
import { MsgRepo } from "./msg-repo";
import { ProfileRepo } from "./profile-repo";
import { ResRepo } from "./res-repo";
import { StorageRepo } from "./storage-repo";
import { TokenRepo } from "./token-repo";
import { TopicRepo } from "./topic-repo";
import { UserRepo } from "./user-repo";

export class Repo implements IRepo {
  readonly client: ClientRepo;
  readonly history: HistoryRepo;
  readonly msg: MsgRepo;
  readonly profile: ProfileRepo;
  readonly res: ResRepo;
  readonly token: TokenRepo;
  readonly topic: TopicRepo;
  readonly user: UserRepo;
  readonly storage: StorageRepo;

  constructor() {
    this.client = new ClientRepo();
    this.history = new HistoryRepo();
    this.msg = new MsgRepo();
    this.profile = new ProfileRepo();
    this.res = new ResRepo();
    this.topic = new TopicRepo(this.res);
    this.token = new TokenRepo();
    this.user = new UserRepo();
    this.storage = new StorageRepo();
  }

  cron() {
    this.topic.cron();
    this.user.cron();
  }
}
