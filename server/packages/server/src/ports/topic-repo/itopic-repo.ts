import { Topic } from "../../entities";
import { IResRepo } from "../res-repo";

export interface TopicQuery {
  id: Array<string> | null;
  title: string | null;
  tags: Array<string> | null;
  activeOnly: boolean | null;
  parent: string | null;
}

export const TopicQuery: TopicQuery = {
  id: null,
  title: null,
  tags: null,
  activeOnly: null,
  parent: null,
};

export interface ITopicRepo {
  resRepo: IResRepo;

  findOne(id: string): Promise<Topic>;

  findTags(limit: number): Promise<Array<{ name: string; count: number }>>;

  insert(topic: Topic): Promise<void>;

  update(topic: Topic): Promise<void>;

  cronTopicCheck(now: Date): Promise<void>;

  find(query: TopicQuery, skip: number, limit: number): Promise<Array<Topic>>;
}
