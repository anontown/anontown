import { isNullish } from "@kgtkr/utils";
import { isNone, Option } from "fp-ts/lib/Option";
import { AtAuthError, AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster } from "../../auth";
import { Client } from "../../entities";
import * as G from "../../generated/graphql";
import { IClientRepo } from "../../ports";
import { fromClient, IClientDB, toClient } from "./iclient-db";

export class ClientRepoMock implements IClientRepo {
  private clients: Array<IClientDB> = [];

  async findOne(id: string): Promise<Client> {
    const client = this.clients.find(c => c._id.toHexString() === id);

    if (client === undefined) {
      throw new AtNotFoundError("クライアントが存在しません");
    }
    return toClient(client);
  }

  async insert(client: Client): Promise<void> {
    this.clients.push(fromClient(client));
  }

  async update(client: Client): Promise<void> {
    this.clients[
      this.clients.findIndex(c => c._id.toHexString() === client.id)
    ] = fromClient(client);
  }

  async find(
    authToken: Option<IAuthTokenMaster>,
    query: G.ClientQuery,
  ): Promise<Array<Client>> {
    if (query.self && isNone(authToken)) {
      throw new AtAuthError("認証が必要です");
    }

    const clients = this.clients
      .filter(
        c =>
          !query.self ||
          isNone(authToken) ||
          c.user.toHexString() === authToken.value.user,
      )
      .filter(
        x => isNullish(query.id) || query.id.includes(x._id.toHexString()),
      )
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());

    return clients.map(c => toClient(c));
  }
}
