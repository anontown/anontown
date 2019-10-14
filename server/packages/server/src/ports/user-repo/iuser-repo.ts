import { ResWaitCountKey, User } from "../../entities";

export interface IUserRepo {
  findOne(id: string): Promise<User>;

  findID(sn: string): Promise<string>;
  insert(user: User): Promise<void>;

  update(user: User): Promise<void>;

  cronPointReset(): Promise<void>;

  cronCountReset(key: ResWaitCountKey): Promise<void>;
}
