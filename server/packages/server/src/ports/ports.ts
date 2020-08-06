import {
  IAuthContainer,
  IClientLoader,
  IClientRepo,
  IClock,
  IHistoryLoader,
  IHistoryRepo,
  IIpContainer,
  ILogger,
  IObjectIdGenerator,
  IProfileLoader,
  IProfileRepo,
  IRecaptchaClient,
  IResLoader,
  IResRepo,
  ISafeIdGenerator,
  IStorageRepo,
  ITokenRepo,
  ITopicLoader,
  ITopicRepo,
  IUserRepo,
} from "../ports";

export interface Ports {
  authContainer: IAuthContainer;
  ipContainer: IIpContainer;
  clock: IClock;
  logger: ILogger;
  clientRepo: IClientRepo;
  historyRepo: IHistoryRepo;
  profileRepo: IProfileRepo;
  resRepo: IResRepo;
  tokenRepo: ITokenRepo;
  topicRepo: ITopicRepo;
  userRepo: IUserRepo;
  storageRepo: IStorageRepo;
  clientLoader: IClientLoader;
  historyLoader: IHistoryLoader;
  profileLoader: IProfileLoader;
  resLoader: IResLoader;
  topicLoader: ITopicLoader;
  recaptcha: IRecaptchaClient;
  safeIdGenerator: ISafeIdGenerator;
  objectIdGenerator: IObjectIdGenerator;
}

export type PortPick<K extends keyof Ports> = Pick<Ports, K>;
