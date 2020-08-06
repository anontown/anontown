import { History } from "../../entities";
import { DateQuery } from "../date-query";

export interface HistoryQuery {
  id: Array<string> | null;
  topic: Array<string> | null;
  date: DateQuery | null;
}

export const HistoryQuery: HistoryQuery = {
  id: null,
  topic: null,
  date: null,
};

export interface IHistoryRepo {
  insert(history: History): Promise<void>;
  update(history: History): Promise<void>;
  findOne(id: string): Promise<History>;
  find(query: HistoryQuery, limit: number): Promise<Array<History>>;
}
