import { option } from "fp-ts";
import { none, some } from "fp-ts/lib/Option";
import {
  FixClock,
  Loader,
  Logger,
  ObjectIdGenerator,
  RecaptchaClient,
  Repo,
  SafeIdGenerator,
} from "../adapters";
import { FixIpContainer } from "../adapters/fix-ip-container/index";
import { AtAuthError } from "../at-error";
import {
  IClock,
  IIpContainer,
  ILoader,
  ILogger,
  IObjectIdGenerator,
  IRecaptchaClient,
  IRepo,
  ISafeIdGenerator,
} from "../ports";
import { AuthContainer } from "./auth-container";
import * as authFromApiParam from "./auth-from-api-param";

export interface AppContext {
  auth: AuthContainer;
  ipContainer: IIpContainer;
  clock: IClock;
  logger: ILogger;
  loader: ILoader;
  repo: IRepo;
  recaptcha: IRecaptchaClient;
  safeIdGenerator: ISafeIdGenerator;
  objectIdGenerator: IObjectIdGenerator;
}

async function createToken(raw: any, repo: IRepo) {
  if (typeof raw !== "string") {
    return none;
  }
  const arr = raw.split(",");
  if (arr.length !== 2) {
    throw new AtAuthError("パラメーターが不正です");
  }

  const [id, key] = arr;
  return some(await authFromApiParam.token(repo.token, { id, key }));
}

export async function createContext(headers: any): Promise<AppContext> {
  const ipContainer = new FixIpContainer(
    option.fromNullable<string>(headers["x-real-ip"]),
  );

  const logger = new Logger(ipContainer);
  const repo = new Repo(logger);

  const token = await createToken(
    headers["x-token"] || headers["X-Token"],
    repo,
  );

  const auth = new AuthContainer(token);

  return {
    auth,
    ipContainer,
    clock: new FixClock(new Date()),
    logger,
    loader: new Loader({
      auth,
      clientRepo: repo.client,
      hisotryRepo: repo.history,
      msgRepo: repo.msg,
      profileRepo: repo.profile,
      resRepo: repo.res,
      topicRepo: repo.topic,
    }),
    repo,
    recaptcha: new RecaptchaClient(),
    safeIdGenerator: new SafeIdGenerator(),
    objectIdGenerator: new ObjectIdGenerator(),
  };
}
