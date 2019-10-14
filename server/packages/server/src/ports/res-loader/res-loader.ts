import { Res } from "../../entities/index";

export interface IResLoader {
  load(id: string): Promise<Res>;
  loadMany(ids: string[]): Promise<Res[]>;
}
