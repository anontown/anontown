import * as DataLoader from "dataloader";
import { History } from "../../entities/index";
import { IHistoryLoader, IHistoryRepo } from "../../ports/index";
import { loader } from "../loader-helper";

export class HistoryLoader implements IHistoryLoader {
  loader: DataLoader<string, History>;

  constructor(historyRepo: IHistoryRepo) {
    this.loader = loader(ids => historyRepo.find({ id: ids }, ids.length));
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: Array<string>) {
    return this.loader.loadMany(ids);
  }
}
