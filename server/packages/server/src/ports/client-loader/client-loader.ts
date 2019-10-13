import { Client } from "../../entities/index";

export interface IClientLoader {
  load(id: string): Promise<Client>;
  loadMany(ids: string[]): Promise<Client[]>;
}
