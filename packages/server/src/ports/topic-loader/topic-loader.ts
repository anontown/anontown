import { Topic } from "../../entities/index";

export interface ITopicLoader {
  load(id: string): Promise<Topic>;
  loadMany(ids: string[]): Promise<Topic[]>;
}
