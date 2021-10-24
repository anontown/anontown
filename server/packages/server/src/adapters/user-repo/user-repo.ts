import { AtConflictError, AtNotFoundError } from "../../at-error";
import { ResWaitCountKey, User } from "../../entities";
import { IUserRepo } from "../../ports";
import * as P from "@prisma/client";
import { PrismaTransactionClient } from "../../prisma-client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

function toEntity(u: P.User): User {
  return new User(
    u.id,
    u.screenName,
    u.encryptedPassword,
    u.lv,
    {
      last: u.resLastCreatedAt,
      m10: u.countCreatedResM10,
      m30: u.countCreatedResM30,
      h1: u.countCreatedResH1,
      h6: u.countCreatedResH6,
      h12: u.countCreatedResH12,
      d1: u.countCreatedResD1,
    },
    u.topicLastCreatedAt,
    u.createdAt,
    u.point,
    u.oneTopicLastCreatedAt,
  );
}

function fromEntity(user: User): Omit<P.Prisma.UserCreateInput, "id"> {
  return {
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
  };
}

export class UserRepo implements IUserRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (user === null) {
      throw new AtNotFoundError("ユーザーが存在しません");
    }

    return toEntity(user);
  }

  async findID(sn: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { screenName: sn },
      select: { id: true },
    });

    if (user === null) {
      throw new AtNotFoundError("ユーザーが存在しません");
    }

    return user.id;
  }

  async insert(user: User): Promise<void> {
    const model = fromEntity(user);
    try {
      await this.prisma.user.create({ data: { ...model, id: user.id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new AtConflictError("スクリーンネームが使われています");
        }
      }
      throw e;
    }
  }

  async update(user: User): Promise<void> {
    const model = fromEntity(user);
    try {
      await this.prisma.user.update({ where: { id: user.id }, data: model });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new AtConflictError("スクリーンネームが使われています");
        }
      }
      throw e;
    }
  }

  async cronPointReset(): Promise<void> {
    await this.prisma.user.updateMany({
      data: { point: 0 },
    });
  }

  async cronCountReset(key: ResWaitCountKey): Promise<void> {
    await this.prisma.user.updateMany({
      data: ((): P.Prisma.UserUpdateInput => {
        switch (key) {
          case "m10":
            return { countCreatedResM10: 0 };
          case "m30":
            return { countCreatedResM30: 0 };
          case "h1":
            return { countCreatedResH1: 0 };
          case "h6":
            return { countCreatedResH6: 0 };
          case "h12":
            return { countCreatedResH12: 0 };
          case "d1":
            return { countCreatedResD1: 0 };
        }
      })(),
    });
  }
}
