import { transaction } from "../prisma-client";
import { array, option } from "fp-ts";
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
import { ITokenRepo } from "../ports";
import { Ports } from "../ports";
import * as authFromApiParam from "./auth-from-api-param";

export interface AppContext {
  ports: Ports;
  prismaOnSuccess: () => Promise<void>;
  prismaOnError: (err: unknown) => Promise<void>;
}

async function createToken(raw: unknown, tokenRepo: ITokenRepo) {
  if (typeof raw !== "string") {
    return none;
  }
  const arr = raw.split(",");
  const id = array.lookup(0, arr);
  const key = array.lookup(1, arr);
  if (option.isNone(id) || option.isNone(key)) {
    throw new AtAuthError("パラメーターが不正です");
  }

  return some(
    await authFromApiParam.tokenHeaderToToken(tokenRepo, {
      id: id.value,
      key: key.value,
    }),
  );
}

export async function createContext(
  headers: Record<string, unknown>,
): Promise<AppContext> {
  const xRealIp = headers["x-real-ip"];
  const ipContainer = new FixIpContainer(
    typeof xRealIp === "string" ? some(xRealIp) : none,
  );

  const logger = new Logger();

  const {
    prismaTransaction,
    prismaOnError,
    prismaOnSuccess,
  } = await transaction();
  const tokenRepo = new TokenRepo(prismaTransaction);

  const token = await createToken(
    headers["x-token"] || headers["X-Token"],
    tokenRepo,
  );

  const authContainer = new AuthContainer(token);

  // TODO: トランザクション
  const clientRepo = new ClientRepo(prismaTransaction);
  const historyRepo = new HistoryRepo(prismaTransaction);
  const msgRepo = new MsgRepo(prismaTransaction);
  const profileRepo = new ProfileRepo(prismaTransaction);
  const resRepo = new ResRepo(prismaTransaction);
  const topicRepo = new TopicRepo(prismaTransaction);
  const userRepo = new UserRepo(prismaTransaction);
  const storageRepo = new StorageRepo(prismaTransaction);
  const clientLoader = new ClientLoader(clientRepo, authContainer);
  const historyLoader = new HistoryLoader(historyRepo);
  const msgLoader = new MsgLoader(msgRepo, authContainer);
  const profileLoader = new ProfileLoader(profileRepo, authContainer);
  const resLoader = new ResLoader(resRepo, authContainer);
  const topicLoader = new TopicLoader(topicRepo);

  return {
    ports: {
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
    },
    prismaOnError,
    prismaOnSuccess,
  };
}
