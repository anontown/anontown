import { Option } from "fp-ts/lib/Option";
import { IAuthTokenMaster } from "../../auth";
import { Client } from "../../entities";

export interface ClientQuery {
  id: Array<string> | null;
  self: boolean | null;
}

export const ClientQuery: ClientQuery = {
  id: null,
  self: null,
};

export interface IClientRepo {
  findOne(id: string): Promise<Client>;
  insert(client: Client): Promise<void>;
  update(client: Client): Promise<void>;
  find(
    authToken: Option<IAuthTokenMaster>,
    query: ClientQuery,
  ): Promise<Array<Client>>;
}
