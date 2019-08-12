import { IClientRepo } from "./client-repo";
import { IHistoryRepo } from "./history-repo";
import { IMsgRepo } from "./msg-repo";
import { IProfileRepo } from "./profile-repo";
import { IResRepo } from "./res-repo";
import { IStorageRepo } from "./storage-repo";
import { ITokenRepo } from "./token-repo";
import { ITopicRepo } from "./topic-repo";
import { IUserRepo } from "./user-repo";

export interface IRepo {
  readonly client: IClientRepo;
  readonly history: IHistoryRepo;
  readonly msg: IMsgRepo;
  readonly profile: IProfileRepo;
  readonly res: IResRepo;
  readonly token: ITokenRepo;
  readonly topic: ITopicRepo;
  readonly user: IUserRepo;
  readonly storage: IStorageRepo;
  cron(): void;
}
