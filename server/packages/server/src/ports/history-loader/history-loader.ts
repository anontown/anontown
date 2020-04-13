import { History } from "../../entities/index";

export interface IHistoryLoader {
  load(id: string): Promise<History>;
  loadMany(ids: Array<string>): Promise<Array<History>>;
}
