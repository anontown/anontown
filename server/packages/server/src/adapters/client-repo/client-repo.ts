import { isNullish } from "@kgtkr/utils";
import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { AtAuthError, AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster } from "../../auth";
import { Client } from "../../entities";
import * as G from "../../generated/graphql";
import { IClientRepo } from "../../ports";
import * as P from "@prisma/client";
import { PrismaTransactionClient } from "../../prisma-client";

function toEntity(c: P.Client): Client {
  return new Client(c.id, c.name, c.url, c.userId, c.createdAt, c.updatedAt);
}

function fromEntity(client: Client): Omit<P.Prisma.ClientCreateInput, "id"> {
  return {
    name: client.name,
    url: client.url,
    userId: client.user,
    createdAt: client.date,
    updatedAt: client.update,
  };
}

export class ClientRepo implements IClientRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async findOne(id: string): Promise<Client> {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (client === null) {
      throw new AtNotFoundError("クライアントが存在しません");
    }
    return toEntity(client);
  }

  async find(
    authToken: Option<IAuthTokenMaster>,
    query: G.ClientQuery,
  ): Promise<Array<Client>> {
    if (query.self && option.isNone(authToken)) {
      throw new AtAuthError("認証が必要です");
    }
    const filter: Array<P.Prisma.ClientWhereInput> = [];
    if (query.self && option.isSome(authToken)) {
      filter.push({ userId: authToken.value.user });
    }
    if (!isNullish(query.id)) {
      filter.push({ id: { in: query.id } });
    }

    const clients = await this.prisma.client.findMany({
      where: {
        AND: filter,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return clients.map(c => toEntity(c));
  }

  async insert(client: Client): Promise<void> {
    const model = fromEntity(client);

    await this.prisma.client.create({ data: { ...model, id: client.id } });
  }

  async update(client: Client): Promise<void> {
    const model = fromEntity(client);
    await this.prisma.client.update({
      where: { id: client.id },
      data: model,
    });
  }
}
