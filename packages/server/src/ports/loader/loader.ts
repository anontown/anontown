import * as DataLoader from "dataloader";
import { Client, History, Msg, Profile, Res, Topic } from "../../entities";

export interface ILoader {
  client: DataLoader<string, Client>;
  history: DataLoader<string, History>;
  msg: DataLoader<string, Msg>;
  profile: DataLoader<string, Profile>;
  res: DataLoader<string, Res>;
  topic: DataLoader<string, Topic>;
}
