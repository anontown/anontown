import { isNullish } from "@kgtkr/utils";
import { AtConflictError, AtNotFoundError } from "../../at-error";
import { Profile } from "../../entities";
import * as G from "../../generated/graphql";
import { IAuthContainer, IProfileRepo } from "../../ports";
import { PrismaTransactionClient } from "../../prisma-client";
import * as P from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

function toEntity(p: P.Profile): Profile {
  return new Profile(
    p.id,
    p.userId,
    p.name,
    p.description,
    p.createdAt,
    p.updatedAt,
    p.screenName,
  );
}

function fromEntity(profile: Profile): Omit<P.Prisma.ProfileCreateInput, "id"> {
  return {
    userId: profile.user,
    name: profile.name,
    description: profile.text,
    createdAt: profile.date,
    updatedAt: profile.update,
    screenName: profile.sn,
  };
}

export class ProfileRepo implements IProfileRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async findOne(id: string): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (profile === null) {
      throw new AtNotFoundError("プロフィールが存在しません");
    }

    return toEntity(profile);
  }

  async find(
    auth: IAuthContainer,
    query: G.ProfileQuery,
  ): Promise<Array<Profile>> {
    const filter: Array<P.Prisma.ProfileWhereInput> = [];
    if (query.self) {
      filter.push({ userId: auth.getToken().id });
    }
    if (!isNullish(query.id)) {
      filter.push({ id: { in: query.id } });
    }
    const profiles = await this.prisma.profile.findMany({
      where: {
        AND: filter,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return profiles.map(p => toEntity(p));
  }

  async insert(profile: Profile): Promise<void> {
    try {
      const model = fromEntity(profile);
      await this.prisma.profile.create({
        data: {
          ...model,
          id: profile.id,
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new AtConflictError("スクリーンネームが使われています");
        }
      }
      throw e;
    }
  }

  async update(profile: Profile): Promise<void> {
    try {
      await this.prisma.profile.update({
        where: { id: profile.id },
        data: fromEntity(profile),
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          throw new AtConflictError("スクリーンネームが使われています");
        }
      }
      throw e;
    }
  }
}
