import { Topic } from "../../entities";
import * as G from "../../generated/graphql";
import { IResRepo } from "../res-repo";

export interface ITopicRepo {
  resRepo: IResRepo;

  findOne(id: string): Promise<Topic>;

  findTags(limit: number): Promise<Array<{ name: string; count: number }>>;

  insert(topic: Topic): Promise<void>;

  update(topic: Topic): Promise<void>;

  cronTopicCheck(now: Date): Promise<void>;

  find(query: G.TopicQuery, skip: number, limit: number): Promise<Array<Topic>>;
}
