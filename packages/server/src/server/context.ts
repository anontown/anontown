import { option } from "fp-ts";
import { none, some } from "fp-ts/lib/Option";
import {
  AuthContainer,
  ClientLoader,
  ClientRepo,
  FixClock,
  HistoryLoader,
  HistoryRepo,
  Logger,
  MsgLoader,
  MsgRepo,
  ObjectIdGenerator,
  ProfileLoader,
  ProfileRepo,
  RecaptchaClient,
  ResLoader,
  ResRepo,
  SafeIdGenerator,
  StorageRepo,
  TokenRepo,
  TopicLoader,
  TopicRepo,
  UserRepo,
} from "../adapters";
import { FixIpContainer } from "../adapters/fix-ip-container/index";
import { AtAuthError } from "../at-error";
import {
  IAuthContainer,
  IClientLoader,
  IClientRepo,
  IClock,
  IHistoryLoader,
  IHistoryRepo,
  IIpContainer,
  ILogger,
  IMsgRepo,
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
import { IMsgLoader } from "../ports/msg-loader/msg-loader";
import * as authFromApiParam from "./auth-from-api-param";

export interface AppContext {
  authContainer: IAuthContainer;
  ipContainer: IIpContainer;
  clock: IClock;
  logger: ILogger;
  clientRepo: IClientRepo;
  historyRepo: IHistoryRepo;
  msgRepo: IMsgRepo;
  profileRepo: IProfileRepo;
  resRepo: IResRepo;
  tokenRepo: ITokenRepo;
  topicRepo: ITopicRepo;
  userRepo: IUserRepo;
  storageRepo: IStorageRepo;
  clientLoader: IClientLoader;
  historyLoader: IHistoryLoader;
  msgLoader: IMsgLoader;
  profileLoader: IProfileLoader;
  resLoader: IResLoader;
  topicLoader: ITopicLoader;
  recaptcha: IRecaptchaClient;
  safeIdGenerator: ISafeIdGenerator;
  objectIdGenerator: IObjectIdGenerator;
}

async function createToken(raw: any, tokenRepo: ITokenRepo) {
  if (typeof raw !== "string") {
    return none;
  }
  const arr = raw.split(",");
  if (arr.length !== 2) {
    throw new AtAuthError("パラメーターが不正です");
  }

  const [id, key] = arr;
  return some(await authFromApiParam.token(tokenRepo, { id, key }));
}

export async function createContext(headers: any): Promise<AppContext> {
  const ipContainer = new FixIpContainer(
    option.fromNullable<string>(headers["x-real-ip"]),
  );

  const logger = new Logger();

  const tokenRepo = new TokenRepo();

  const token = await createToken(
    headers["x-token"] || headers["X-Token"],
    tokenRepo,
  );

  const authContainer = new AuthContainer(token);

  const clientRepo = new ClientRepo();
  const historyRepo = new HistoryRepo();
  const msgRepo = new MsgRepo();
  const profileRepo = new ProfileRepo();
  const resRepo = new ResRepo();
  const topicRepo = new TopicRepo(resRepo);
  const userRepo = new UserRepo();
  const storageRepo = new StorageRepo();
  const clientLoader = new ClientLoader(clientRepo, authContainer);
  const historyLoader = new HistoryLoader(historyRepo);
  const msgLoader = new MsgLoader(msgRepo, authContainer);
  const profileLoader = new ProfileLoader(profileRepo, authContainer);
  const resLoader = new ResLoader(resRepo, authContainer);
  const topicLoader = new TopicLoader(topicRepo);

  return {
    authContainer,
    ipContainer,
    clock: new FixClock(new Date()),
    logger,
    recaptcha: new RecaptchaClient(),
    safeIdGenerator: new SafeIdGenerator(),
    objectIdGenerator: new ObjectIdGenerator(),
    clientRepo,
    historyRepo,
    msgRepo,
    profileRepo,
    resRepo,
    tokenRepo,
    topicRepo,
    userRepo,
    storageRepo,
    clientLoader,
    historyLoader,
    msgLoader,
    profileLoader,
    resLoader,
    topicLoader,
  };
}
