import { none, some } from "fp-ts/lib/Option";
import { ObjectID } from "bson";
import {
  AtError,
  IAuthTokenGeneral,
  IAuthTokenMaster,
  IStorageRepo,
  Storage,
} from "../../";

export function run(
  $isolate: (callback: (repo: IStorageRepo) => Promise<void>) => Promise<void>,
) {
  const client = new ObjectID().toHexString();
  const user = new ObjectID().toHexString();
  const key = "key";
  const storage = new Storage(some(client), user, key, "value");

  describe("findOneKey", () => {
    it("正常に検索出来るか", async () => {
      await $isolate(async repo => {
        const client1 = new ObjectID().toHexString();
        const client2 = new ObjectID().toHexString();

        const user1 = new ObjectID().toHexString();
        const user2 = new ObjectID().toHexString();

        const key1 = "key1";
        const key2 = "key2";

        const authGeneral: IAuthTokenGeneral = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user: user1,
          type: "general",
          client: client1,
        };

        const authMaster: IAuthTokenMaster = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user: user1,
          type: "master",
        };

        const storage1 = storage.copy({
          client: none,
          user: user1,
          key: key1,
        });

        const storage2 = storage.copy({
          client: none,
          user: user1,
          key: key2,
        });

        const storage3 = storage.copy({
          client: none,
          user: user2,
          key: key1,
        });

        const storage4 = storage.copy({
          client: some(client1),
          user: user1,
          key: key1,
        });

        const storage5 = storage.copy({
          client: some(client1),
          user: user1,
          key: key2,
        });

        const storage6 = storage.copy({
          client: some(client1),
          user: user2,
          key: key1,
        });

        const storage7 = storage.copy({
          client: some(client2),
          user: user1,
          key: key1,
        });

        await repo.save(storage1);
        await repo.save(storage2);
        await repo.save(storage3);
        await repo.save(storage4);
        await repo.save(storage5);
        await repo.save(storage6);
        await repo.save(storage7);

        expect(await repo.findOneKey(authMaster, key1)).toEqual(storage1);
        expect(await repo.findOneKey(authGeneral, key1)).toEqual(storage4);
      });
    });
    it("存在しない時エラーになるか(通常トークン)", async () => {
      await $isolate(async repo => {
        const authGeneral: IAuthTokenGeneral = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user,
          type: "general",
          client,
        };

        const authMaster: IAuthTokenMaster = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user,
          type: "master",
        };

        await repo.save(storage);

        await expect(
          repo.findOneKey(
            { ...authGeneral, user: new ObjectID().toHexString() },
            key,
          ),
        ).rejects.toThrow(AtError);
        await expect(
          repo.findOneKey(
            { ...authGeneral, client: new ObjectID().toHexString() },
            key,
          ),
        ).rejects.toThrow(AtError);
        await expect(repo.findOneKey(authGeneral, "key2")).rejects.toThrow(
          AtError,
        );
        await expect(repo.findOneKey(authMaster, key)).rejects.toThrow(AtError);
      });
    });
  });

  describe("find", () => {
    it("正常に検索出来るか", async () => {
      await $isolate(async repo => {
        const storage = new Storage(
          none,
          new ObjectID().toHexString(),
          "key",
          "value",
        );

        const client1 = new ObjectID().toHexString();
        const client2 = new ObjectID().toHexString();

        const user1 = new ObjectID().toHexString();
        const user2 = new ObjectID().toHexString();

        const key1 = "key1";
        const key2 = "key2";

        const authGeneral: IAuthTokenGeneral = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user: user1,
          type: "general",
          client: client1,
        };

        const authMaster: IAuthTokenMaster = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user: user1,
          type: "master",
        };

        const storage1 = storage.copy({
          client: none,
          user: user1,
          key: key1,
        });

        const storage2 = storage.copy({
          client: none,
          user: user1,
          key: key2,
        });

        const storage3 = storage.copy({
          client: none,
          user: user2,
          key: key1,
        });

        const storage4 = storage.copy({
          client: some(client1),
          user: user1,
          key: key1,
        });

        const storage5 = storage.copy({
          client: some(client1),
          user: user1,
          key: key2,
        });

        const storage6 = storage.copy({
          client: some(client1),
          user: user2,
          key: key1,
        });

        const storage7 = storage.copy({
          client: some(client2),
          user: user1,
          key: key1,
        });

        await repo.save(storage1);
        await repo.save(storage2);
        await repo.save(storage3);
        await repo.save(storage4);
        await repo.save(storage5);
        await repo.save(storage6);
        await repo.save(storage7);

        expect(await repo.find(authMaster, {})).toEqual([storage1, storage2]);
        expect(await repo.find(authMaster, { key: [] })).toEqual([]);
        expect(await repo.find(authMaster, { key: [key1] })).toEqual([
          storage1,
        ]);

        expect(await repo.find(authGeneral, {})).toEqual([storage4, storage5]);
        expect(await repo.find(authGeneral, { key: [] })).toEqual([]);
        expect(await repo.find(authGeneral, { key: [key2] })).toEqual([
          storage5,
        ]);
      });
    });
  });

  describe("save", () => {
    it("新しく作れるか", async () => {
      await $isolate(async repo => {
        await repo.save(storage);

        const authGeneral: IAuthTokenGeneral = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user,
          type: "general",
          client,
        };

        expect(await repo.findOneKey(authGeneral, key)).toEqual(storage);
      });
    });

    it("更新出来るか", async () => {
      await $isolate(async repo => {
        await repo.save(storage);

        const storageUpdate = storage.copy({ value: "value2" });
        await repo.save(storageUpdate);

        const authGeneral: IAuthTokenGeneral = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user,
          type: "general",
          client,
        };

        expect(await repo.findOneKey(authGeneral, key)).toEqual(storageUpdate);
      });
    });
  });

  describe("del", () => {
    it("正常に削除出来るか", async () => {
      await $isolate(async repo => {
        await repo.save(storage);
        await repo.del(storage);

        const authGeneral: IAuthTokenGeneral = {
          id: new ObjectID().toHexString(),
          key: "tk",
          user,
          type: "general",
          client,
        };

        await expect(repo.findOneKey(authGeneral, key)).rejects.toThrow(
          AtError,
        );
      });
    });
  });
}
