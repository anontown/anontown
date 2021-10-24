import { isNullish } from "@kgtkr/utils";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { AtNotFoundError } from "../../at-error";
import { IAuthToken } from "../../auth";
import { Storage } from "../../entities";
import * as G from "../../generated/graphql";
import { IStorageRepo } from "../../ports";
import * as P from "@prisma/client";
import { PrismaTransactionClient } from "../../prisma-client";

function toEntity(db: P.Storage): Storage {
  return new Storage(
    pipe(
      O.some(db.clientId),
      O.filter(client => client !== ""),
    ),
    db.userId,
    db.key,
    db.value,
  );
}

function fromEntityToUniqueKey(
  entity: Omit<Storage, "value">,
): P.Prisma.StorageClientIdUserIdKeyCompoundUniqueInput {
  return {
    clientId: pipe(
      entity.client,
      O.getOrElse(() => ""),
    ),
    userId: entity.user,
    key: entity.key,
  };
}

function fromEntity(
  storage: Storage,
): Omit<P.Prisma.StorageCreateInput, "userId" | "clientId" | "key"> {
  return {
    value: storage.value,
  };
}

export class StorageRepo implements IStorageRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async find(
    token: IAuthToken,
    query: G.StorageQuery,
  ): Promise<Array<Storage>> {
    const filter: Array<P.Prisma.StorageWhereInput> = [
      {
        userId: token.user,
        clientId: token.type === "general" ? token.client : "",
      },
    ];

    if (!isNullish(query.key)) {
      filter.push({
        key: {
          in: query.key,
        },
      });
    }
    const storages = await this.prisma.storage.findMany({
      where: {
        AND: filter,
      },
    });
    return storages.map(x => toEntity(x));
  }

  async findOneKey(token: IAuthToken, key: string): Promise<Storage> {
    const model = await this.prisma.storage.findUnique({
      where: {
        clientId_userId_key: {
          clientId: token.type === "general" ? token.client : "",
          userId: token.user,
          key,
        },
      },
    });

    if (model === null) {
      throw new AtNotFoundError("ストレージが見つかりません");
    }
    return toEntity(model);
  }
  async save(storage: Storage): Promise<void> {
    await this.prisma.storage.upsert({
      where: {
        clientId_userId_key: fromEntityToUniqueKey(storage),
      },
      update: fromEntity(storage),
      create: {
        ...fromEntityToUniqueKey(storage),
        ...fromEntity(storage),
      },
    });
  }
  async del(storage: Storage): Promise<void> {
    await this.prisma.storage.delete({
      where: {
        clientId_userId_key: fromEntityToUniqueKey(storage),
      },
    });
  }
}
