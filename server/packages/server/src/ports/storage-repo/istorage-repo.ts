import { IAuthToken } from "../../auth";
import { Storage } from "../../entities";

export interface StorageQuery {
  key: Array<string> | null;
}

export const StorageQuery: StorageQuery = {
  key: null,
};

export interface IStorageRepo {
  findOneKey(token: IAuthToken, key: string): Promise<Storage>;
  find(token: IAuthToken, query: StorageQuery): Promise<Array<Storage>>;
  save(storage: Storage): Promise<void>;
  del(storage: Storage): Promise<void>;
}
