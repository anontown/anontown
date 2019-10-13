import { History } from "../../entities/index";

export interface IHistoryLoader {
  load(id: string): Promise<History>;
  loadMany(ids: string[]): Promise<History[]>;
}
