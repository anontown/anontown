import { ObjectID } from "mongodb";
import { MongoClient } from "mongodb";
import * as es from "elasticsearch";
import * as P from "@prisma/client";

interface IClientDB {
  readonly _id: ObjectID;
  readonly name: string;
  readonly url: string;
  readonly user: ObjectID;
  readonly date: Date;
  readonly update: Date;
}

interface IHistoryDB {
  readonly id: string;
  readonly body: {
    readonly topic: string;
    readonly title: string;
    readonly tags: Array<string>;
    readonly text: string;
    readonly date: string;
    readonly hash: string;
    readonly user: string;
  };
}

interface IMsgDB {
  readonly id: string;
  readonly body: {
    readonly receiver: string | null;
    readonly text: string;
    readonly date: string;
  };
}

interface IProfileDB {
  readonly _id: ObjectID;
  readonly user: ObjectID;
  readonly name: string;
  readonly text: string;
  readonly date: Date;
  readonly update: Date;
  readonly sn: string;
}
type ResType = "normal" | "history" | "topic" | "fork";

interface IResDB {
  id: string;
  body:
    | IResNormalDB["body"]
    | IResHistoryDB["body"]
    | IResTopicDB["body"]
    | IResForkDB["body"];
}

interface IResBaseDB<T extends ResType, Body> {
  readonly id: string;
  readonly body: {
    readonly type: T;
    readonly topic: string;
    readonly date: string;
    readonly user: string;
    readonly votes: Array<IVote>;
    readonly lv: number;
    readonly hash: string;
  } & Body;
}

type IResNormalDB = IResBaseDB<
  "normal",
  {
    readonly name: string | null;
    readonly text: string;
    readonly reply: IReply | null;
    readonly deleteFlag: ResDeleteFlag;
    readonly profile: string | null;
    readonly age: boolean;
  }
>;

type IResHistoryDB = IResBaseDB<
  "history",
  {
    history: string;
  }
>;

type IResTopicDB = IResBaseDB<"topic", {}>;

type IResForkDB = IResBaseDB<
  "fork",
  {
    fork: string;
  }
>;

type VoteFlag = "uv" | "dv" | "not";
type ResDeleteFlag = "active" | "self" | "freeze";
interface IReply {
  readonly res: string;
  readonly user: string;
}
interface IVote {
  readonly user: string;
  readonly value: number;
}

interface IStorageDB {
  client: ObjectID | null;
  user: ObjectID;
  key: string;
  value: string;
}

type ITokenDB = ITokenGeneralDB | ITokenMasterDB;

interface ITokenBaseDB<T extends TokenType> {
  readonly _id: ObjectID;
  readonly key: string;
  readonly type: T;
  readonly user: ObjectID;
  readonly date: Date;
}

interface ITokenMasterDB extends ITokenBaseDB<"master"> {}

interface ITokenGeneralDB extends ITokenBaseDB<"general"> {
  readonly client: ObjectID;
  readonly req: Array<ITokenReq>;
}

type TokenType = "master" | "general";
interface ITokenReq {
  readonly key: string;
  readonly expireDate: Date;
  readonly active: boolean;
}
interface ITopicDB {
  id: string;
  body: ITopicNormalDB["body"] | ITopicOneDB["body"] | ITopicForkDB["body"];
}

interface ITopicBaseDB<T extends TopicType, Body> {
  readonly id: string;
  readonly body: {
    readonly type: T;
    readonly title: string;
    readonly update: string;
    readonly date: string;
    readonly ageUpdate: string;
    readonly active: boolean;
  } & Body;
}

type ITopicSearchBaseDB<T extends TopicSearchType> = ITopicBaseDB<
  T,
  {
    readonly tags: Array<string>;
    readonly text: string;
  }
>;

type ITopicNormalDB = ITopicSearchBaseDB<"normal">;

type ITopicOneDB = ITopicSearchBaseDB<"one">;

type ITopicForkDB = ITopicBaseDB<
  "fork",
  {
    readonly parent: string;
  }
>;
type TopicSearchType = "one" | "normal";
type TopicType = TopicSearchType | "fork";
interface IUserDB {
  readonly _id: ObjectID;
  readonly sn: string;
  readonly pass: string;
  readonly lv: number;
  readonly resWait: IResWait;
  readonly lastTopic: Date;
  readonly date: Date;
  readonly point: number;
  readonly lastOneTopic: Date;
}
interface IResWait {
  readonly last: Date;
  readonly m10: number;
  readonly m30: number;
  readonly h1: number;
  readonly h6: number;
  readonly h12: number;
  readonly d1: number;
}

(async () => {
  const Mongo = await MongoClient.connect(
    `mongodb://${process.env["MONGO_HOST"]}/anontown`,
    {
      useNewUrlParser: true,
    }
  );

  const db = Mongo.db();

  const ESClient = new es.Client({
    host: `http://${process.env["ES_HOST"]}:9200`,
    log: "error",
    apiVersion: "6.8",
  });

  const prisma = new P.PrismaClient();

  const clients = await db.collection<IClientDB>("clients").find().toArray();

  await prisma.client.createMany({
    data: clients.map((client) => ({
      id: client._id.toHexString(),
      name: client.name,
      url: client.url,
      userId: client.user.toHexString(),
      createdAt: client.date,
      updatedAt: client.update,
    })),
  });

  const profiles = await db.collection<IProfileDB>("profiles").find().toArray();

  await prisma.profile.createMany({
    data: profiles.map((profile) => ({
      id: profile._id.toHexString(),
      userId: profile.user.toHexString(),
      name: profile.name,
      description: profile.text,
      createdAt: profile.date,
      updatedAt: profile.update,
      screenName: profile.sn,
    })),
  });

  const tokens = await db.collection<ITokenDB>("tokens").find().toArray();

  /*
  model Token {
  id        String    @id @db.VarChar(64)
  key       String    @db.Text
  type      TokenType
  userId    String    @db.VarChar(64)
  createdAt DateTime  @map("created_at") @db.Timestamptz(3)

  // normal
  clientId String?    @db.VarChar(64)
  reqs     TokenReq[]

  @@index([type])
  @@index([userId])
  @@index([createdAt])
  @@index([clientId])
  @@map("tokens")
}
  */

  await prisma.token.createMany({
    data: tokens.map((token) => ({
      id: token._id.toHexString(),
      key: token.key,
      type:
        token.type === "general" ? ("GENERAL" as const) : ("MASTER" as const),
      userId: token.user.toHexString(),
      createdAt: token.date,
      clientId: token.type === "general" ? token.client.toHexString() : null,
    })),
  });

  await prisma.tokenReq.createMany({
    data: tokens
      .filter((token): token is ITokenGeneralDB => token.type === "general")
      .flatMap((token) =>
        token.req.map((req) => ({
          key: req.key,
          expires: req.expireDate,
          active: req.active,
          tokenId: token._id.toHexString(),
        }))
      ),
  });

  const users = await db.collection<IUserDB>("users").find().toArray();

  await prisma.user.createMany({
    data: users.map((user) => ({
      id: user._id.toHexString(),
      screenName: user.sn,
      encryptedPassword: user.pass,
      lv: user.lv,
      resLastCreatedAt: user.resWait.last,
      countCreatedResM10: user.resWait.m10,
      countCreatedResM30: user.resWait.m30,
      countCreatedResH1: user.resWait.h1,
      countCreatedResH6: user.resWait.h6,
      countCreatedResH12: user.resWait.h12,
      countCreatedResD1: user.resWait.d1,
      topicLastCreatedAt: user.lastTopic,
      createdAt: user.date,
      point: user.point,
      oneTopicLastCreatedAt: user.lastOneTopic,
    })),
  });

  const storages = await db.collection<IStorageDB>("storages").find().toArray();
  await prisma.storage.createMany({
    data: storages.map((storage) => ({
      clientId: storage.client ? storage.client.toHexString() : "",
      userId: storage.user.toHexString(),
      key: storage.key,
      value: storage.value,
    })),
  });

  const reses = await ESClient.search<IResDB["body"]>({
    index: "reses",
    size: 1000000,
    body: {},
  });

  await prisma.res.createMany({
    data: reses.hits.hits.map((res) => ({
      id: res._id,
      type: (() => {
        switch (res._source.type) {
          case "topic":
            return "TOPIC" as const;
          case "normal":
            return "NORMAL" as const;
          case "history":
            return "HISTORY" as const;
          case "fork":
            return "FORK" as const;
        }
      })(),
      topicId: res._source.topic,
      createdAt: res._source.date,
      userId: res._source.user,
      lv: res._source.lv,
      hash: res._source.hash,
      name: res._source.type === "normal" ? res._source.name : null,
      content: res._source.type === "normal" ? res._source.text : null,
      replyId: res._source.type === "normal" ? res._source.reply?.res : null,
      deleteFlag:
        res._source.type === "normal"
          ? (() => {
              switch ((res._source as IResNormalDB["body"]).deleteFlag) {
                case "active":
                  return "ACTIVE" as const;
                case "self":
                  return "SELF" as const;
                case "freeze":
                  return "FREEZE" as const;
              }
            })()
          : null,
      profileId: res._source.type === "normal" ? res._source.profile : null,
      age: res._source.type === "normal" ? res._source.age : null,
      historyId: res._source.type === "history" ? res._source.history : null,
      forkId: res._source.type === "fork" ? res._source.fork : null,
    })),
  });

  await prisma.resVote.createMany({
    data: reses.hits.hits.flatMap((res) =>
      res._source.votes.map((vote, i) => ({
        resId: res._id,
        order: i,
        userId: vote.user,
        vote: vote.value,
      }))
    ),
  });

  const histories = await ESClient.search<IHistoryDB["body"]>({
    index: "histories",
    size: 1000000,
    body: {},
  });

  await prisma.history.createMany({
    data: histories.hits.hits.map((history) => ({
      id: history._id,
      topicId: history._source.topic,
      title: history._source.title,
      description: history._source.text,
      createdAt: history._source.date,
      hash: history._source.hash,
      userId: history._source.user,
    })),
  });

  await prisma.historyTag.createMany({
    data: histories.hits.hits.flatMap((history) =>
      history._source.tags.map((tag, i) => ({
        historyId: history._id,
        order: i,
        tag,
      }))
    ),
  });

  const msgs = await ESClient.search<IMsgDB["body"]>({
    index: "msgs",
    size: 1000000,
    body: {},
  });

  await prisma.msg.createMany({
    data: msgs.hits.hits.map((msg) => ({
      id: msg._id,
      receiverId: msg._source.receiver,
      content: msg._source.text,
      createdAt: msg._source.date,
    })),
  });

  const topics = await ESClient.search<ITopicDB["body"]>({
    index: "topics",
    size: 1000000,
    body: {},
  });

  await prisma.topic.createMany({
    data: topics.hits.hits.map((topic) => ({
      id: topic._id,
      type: (() => {
        switch (topic._source.type) {
          case "normal":
            return "NORMAL" as const;
          case "one":
            return "ONE" as const;
          case "fork":
            return "FORK" as const;
        }
      })(),
      title: topic._source.title,
      updatedAt: topic._source.update,
      createdAt: topic._source.date,
      ageUpdatedAt: topic._source.ageUpdate,
      active: topic._source.active,
      description:
        topic._source.type === "normal" || topic._source.type === "one"
          ? topic._source.text
          : null,
      parentId: topic._source.type === "fork" ? topic._source.parent : null,
    })),
  });

  await prisma.topicTag.createMany({
    data: topics.hits.hits.flatMap((topic) =>
      topic._source.type === "normal" || topic._source.type === "one"
        ? topic._source.tags.map((tag, i) => ({
            topicId: topic._id,
            order: i,
            tag,
          }))
        : []
    ),
  });
})();
