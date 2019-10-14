import * as Im from "immutable";
import { ObjectID } from "mongodb";
import {
  AtError,
  dbReset,
  ITokenRepo,
  TokenGeneral,
  TokenMaster,
} from "../../";

export function run(repoGene: () => ITokenRepo, isReset: boolean) {
  beforeEach(async () => {
    if (isReset) {
      await dbReset();
    }
  });

  const userID = new ObjectID().toHexString();

  const tokenMaster = new TokenMaster(
    new ObjectID().toHexString(),
    "key",
    userID,
    new Date(0),
  );

  const tokenGeneral = new TokenGeneral(
    new ObjectID().toHexString(),
    "key",
    new ObjectID().toHexString(),
    userID,
    Im.List(),
    new Date(0),
  );

  describe("findOne", () => {
    it("正常に探せるか", async () => {
      const repo = repoGene();

      await repo.insert(tokenMaster);
      await repo.insert(tokenGeneral);

      expect(await repo.findOne(tokenMaster.id)).toEqual(tokenMaster);
      expect(await repo.findOne(tokenGeneral.id)).toEqual(tokenGeneral);
    });

    it("存在しない時エラーになるか", async () => {
      const repo = repoGene();

      await repo.insert(tokenMaster);

      await expect(repo.findOne(new ObjectID().toHexString())).rejects.toThrow(
        AtError,
      );
    });
  });

  describe("findAll", () => {
    it("正常に探せるか", async () => {
      const repo = repoGene();

      const user1 = new ObjectID().toHexString();
      const user2 = new ObjectID().toHexString();
      const user3 = new ObjectID().toHexString();

      const token1 = tokenMaster.copy({
        id: new ObjectID().toHexString(),
        user: user1,
        date: new Date(50),
      });
      const token2 = tokenGeneral.copy({
        id: new ObjectID().toHexString(),
        user: user1,
        date: new Date(80),
      });
      const token3 = tokenMaster.copy({
        id: new ObjectID().toHexString(),
        user: user1,
        date: new Date(30),
      });
      const token4 = tokenGeneral.copy({
        id: new ObjectID().toHexString(),
        user: user2,
        date: new Date(90),
      });

      await repo.insert(token1);
      await repo.insert(token2);
      await repo.insert(token3);
      await repo.insert(token4);

      expect(
        await repo.findAll({
          id: new ObjectID().toHexString(),
          key: "key",
          user: user1,
          type: "master",
        }),
      ).toEqual([token2, token1, token3]);

      expect(
        await repo.findAll({
          id: new ObjectID().toHexString(),
          key: "key",
          user: user2,
          type: "master",
        }),
      ).toEqual([token4]);

      expect(
        await repo.findAll({
          id: new ObjectID().toHexString(),
          key: "key",
          user: user3,
          type: "master",
        }),
      ).toEqual([]);
    });
  });

  describe("insert", () => {
    it("正常に保存出来るか", async () => {
      const repo = repoGene();

      await repo.insert(tokenMaster);

      expect(await repo.findOne(tokenMaster.id)).toEqual(tokenMaster);
    });

    // TODO:ID被り
  });

  describe("update", () => {
    it("正常に更新出来るか", async () => {
      const repo = repoGene();

      const token1 = tokenMaster.copy({
        id: new ObjectID().toHexString(),
        key: "key1",
      });
      const token2 = tokenGeneral.copy({
        id: new ObjectID().toHexString(),
        key: "key2",
      });
      const token1update = token1.copy({ key: "update" });
      const token2update = token2.copy({ key: "update" });

      await repo.insert(token1);
      await repo.insert(token2);

      await repo.update(token1update);

      expect(await repo.findOne(token2.id)).toEqual(token2);

      await repo.update(token2update);

      expect(await repo.findOne(token1.id)).toEqual(token1update);
      expect(await repo.findOne(token2.id)).toEqual(token2update);
    });

    // TODO:存在しないID
  });

  describe("delClientToken", () => {
    it("正常に削除出来るか", async () => {
      const repo = repoGene();

      const token1 = tokenGeneral.copy({ id: new ObjectID().toHexString() });
      const token2 = tokenGeneral.copy({ id: new ObjectID().toHexString() });
      const token3 = tokenGeneral.copy({
        id: new ObjectID().toHexString(),
        client: new ObjectID().toHexString(),
      });
      const token4 = tokenGeneral.copy({
        id: new ObjectID().toHexString(),
        user: new ObjectID().toHexString(),
      });
      const token5 = tokenMaster.copy({ id: new ObjectID().toHexString() });

      await repo.insert(token1);
      await repo.insert(token2);
      await repo.insert(token3);
      await repo.insert(token4);
      await repo.insert(token5);

      await repo.delClientToken(
        {
          id: new ObjectID().toHexString(),
          key: "key",
          user: tokenGeneral.user,
          type: "master",
        },
        tokenGeneral.client,
      );

      await expect(repo.findOne(token1.id)).rejects.toThrow(AtError);
      await expect(repo.findOne(token2.id)).rejects.toThrow(AtError);
      expect(await repo.findOne(token3.id)).toEqual(token3);
      expect(await repo.findOne(token4.id)).toEqual(token4);
      expect(await repo.findOne(token5.id)).toEqual(token5);
    });
  });

  describe("delMasterToken", () => {
    it("正常に削除出来るか", async () => {
      const repo = repoGene();

      const token1 = tokenMaster.copy({ id: new ObjectID().toHexString() });
      const token2 = tokenMaster.copy({ id: new ObjectID().toHexString() });
      const token3 = tokenMaster.copy({
        id: new ObjectID().toHexString(),
        user: new ObjectID().toHexString(),
      });
      const token4 = tokenGeneral.copy({ id: new ObjectID().toHexString() });

      await repo.insert(token1);
      await repo.insert(token2);
      await repo.insert(token3);
      await repo.insert(token4);

      await repo.delMasterToken({
        id: token1.user,
        pass: "pass",
      });

      await expect(repo.findOne(token1.id)).rejects.toThrow(AtError);
      await expect(repo.findOne(token2.id)).rejects.toThrow(AtError);
      expect(await repo.findOne(token3.id)).toEqual(token3);
      expect(await repo.findOne(token4.id)).toEqual(token4);
    });
  });
}
