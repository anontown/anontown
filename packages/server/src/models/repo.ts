import { ClientRepo } from "./client";
import { HistoryRepo } from "./history";
import { IRepo } from "./irepo";
import { MsgRepo } from "./msg";
import { ProfileRepo } from "./profile";
import { ResRepo } from "./res";
import { StorageRepo } from "./storage";
import { TokenRepo } from "./token";
import { TopicRepo } from "./topic";
import { UserRepo } from "./user";

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
