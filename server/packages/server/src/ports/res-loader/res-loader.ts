import { Res } from "../../entities/index";

export interface IResLoader {
  load(id: string): Promise<Res>;
  loadMany(ids: Array<string>): Promise<Array<Res>>;
}
