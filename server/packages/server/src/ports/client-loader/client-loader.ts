import { Client } from "../../entities/index";

export interface IClientLoader {
  load(id: string): Promise<Client>;
  loadMany(ids: Array<string>): Promise<Array<Client>>;
}
