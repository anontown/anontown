import * as DataLoader from "dataloader";
import { Topic } from "../../entities/index";
import { ITopicLoader, ITopicRepo, TopicQuery } from "../../ports/index";
import { loader } from "../loader-helper";

export class TopicLoader implements ITopicLoader {
  loader: DataLoader<string, Topic>;

  constructor(topicRepo: ITopicRepo) {
    this.loader = loader(ids =>
      topicRepo.find({ ...TopicQuery, id: ids }, 0, ids.length),
    );
  }

  load(id: string) {
    return this.loader.load(id);
  }

  loadMany(ids: Array<string>) {
    return this.loader.loadMany(ids);
  }
}
