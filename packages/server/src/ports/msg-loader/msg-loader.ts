import { Msg } from "../../entities/index";

export interface IMsgLoader {
  load(id: string): Promise<Msg>;
  loadMany(ids: string[]): Promise<Msg[]>;
}
