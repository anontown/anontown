import { Topic } from "../../entities/index";

export interface ITopicLoader {
  load(id: string): Promise<Topic>;
  loadMany(ids: Array<string>): Promise<Array<Topic>>;
}
