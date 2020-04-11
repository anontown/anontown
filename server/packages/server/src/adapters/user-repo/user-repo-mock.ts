import { AtConflictError, AtNotFoundError } from "../../at-error";
import { ResWaitCountKey, User } from "../../entities";
import { IUserRepo } from "../../ports";
import { fromUser, IUserDB, toUser } from "./iuser-db";

export class UserRepoMock implements IUserRepo {
  private users: Array<IUserDB> = [];

  async findOne(id: string): Promise<User> {
    const user = this.users.find(x => x._id.toHexString() === id);

    if (user === undefined) {
      throw new AtNotFoundError("ユーザーが存在しません");
    }

    return toUser(user);
  }

  async findID(sn: string): Promise<string> {
    const user = this.users.find(x => x.sn === sn);

    if (user === undefined) {
      throw new AtNotFoundError("ユーザーが存在しません");
    }

    return user._id.toHexString();
  }

  async insert(user: User): Promise<void> {
    if (this.users.findIndex(x => x.sn === user.sn) !== -1) {
      throw new AtConflictError("スクリーンネームが使われています");
    }

    this.users.push(fromUser(user));
  }

  async update(user: User): Promise<void> {
    if (
      this.users.findIndex(
        x => x.sn === user.sn && x._id.toHexString() !== user.id,
      ) !== -1
    ) {
      throw new AtConflictError("スクリーンネームが使われています");
    }

    this.users[
      this.users.findIndex(x => x._id.toHexString() === user.id)
    ] = fromUser(user);
  }

  async cronPointReset(): Promise<void> {
    this.users = this.users.map(x => ({ ...x, point: 0 }));
  }

  async cronCountReset(key: ResWaitCountKey): Promise<void> {
    this.users = this.users.map(x => ({
      ...x,
      resWait: { ...x.resWait, [key]: 0 },
    }));
  }
}
