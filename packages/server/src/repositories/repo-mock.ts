import { IRepo } from "../ports";
import { ClientRepoMock } from "./client-repo";
import { HistoryRepoMock } from "./history-repo";
import { MsgRepoMock } from "./msg-repo";
import { ProfileRepoMock } from "./profile-repo";
import { ResRepoMock } from "./res-repo";
import { StorageRepoMock } from "./storage-repo";
import { TokenRepoMock } from "./token-repo";
import { TopicRepoMock } from "./topic-repo";
import { UserRepoMock } from "./user-repo";

export class RepoMock implements IRepo {
  readonly client: ClientRepoMock;
  readonly history: HistoryRepoMock;
  readonly msg: MsgRepoMock;
  readonly profile: ProfileRepoMock;
  readonly res: ResRepoMock;
  readonly token: TokenRepoMock;
  readonly topic: TopicRepoMock;
  readonly user: UserRepoMock;
  readonly storage: StorageRepoMock;

  constructor() {
    this.client = new ClientRepoMock();
    this.history = new HistoryRepoMock();
    this.msg = new MsgRepoMock();
    this.profile = new ProfileRepoMock();
    this.res = new ResRepoMock();
    this.topic = new TopicRepoMock(this.res);
    this.token = new TokenRepoMock();
    this.user = new UserRepoMock();
    this.storage = new StorageRepoMock();
  }

  cron() {
    this.topic.cron();
    this.user.cron();
  }
}
