import { ObjectID } from "mongodb";
import { AtError, TokenBase, TokenMaster } from "../../";
import {
  DummyObjectIdGenerator,
  DummySafeIdGenerator,
} from "../../adapters/index";

describe("TokenMaster", () => {
  const tokenID = new ObjectID().toHexString();
  const userID = new ObjectID().toHexString();
  const tokenMaster = new TokenMaster(tokenID, "key", userID, new Date(0));

  describe("create", () => {
    it("正常に生成出来るか", () => {
      expect(
        TokenMaster.create(
          new DummyObjectIdGenerator("token"),
          {
            id: "user",
            pass: "pass",
          },
          new Date(100),
          new DummySafeIdGenerator("key"),
        ),
      ).toEqual(
        new TokenMaster(
          "token",
          TokenBase.createTokenKey(new DummySafeIdGenerator("key")),
          "user",
          new Date(100),
        ),
      );
    });
  });

  describe("toAPI", () => {
    it("正常に変換出来るか", () => {
      const api = tokenMaster.toAPI();
      expect(api).toEqual(tokenMaster.toBaseAPI());
    });
  });

  describe("auth", () => {
    it("正常に認証出来るか", () => {
      const auth = tokenMaster.auth("key");
      expect(auth).toEqual({
        id: tokenMaster.id,
        key: "key",
        user: tokenMaster.user,
        type: "master",
      });
    });

    it("keyが違う時エラーになるか", () => {
      expect(() => {
        tokenMaster.auth("key2");
      }).toThrow(AtError);
    });
  });
});
