import * as Im from "immutable";
import { ObjectID } from "mongodb";
import {
  ITokenBaseAPI,
  TokenBase,
  TokenGeneral,
  TokenMaster,
} from "../../entities";
import { applyMixins, Copyable } from "../../utils";
import {
  fromTokenBase,
  fromTokenGeneral,
  fromTokenMaster,
  toTokenGeneral,
  toTokenMaster,
} from "./itoken-db";

describe("ITokenDB", () => {
  class TokenBaseTest extends Copyable<TokenBaseTest>
    implements TokenBase<"general", TokenBaseTest> {
    readonly type: "general" = "general";

    toBaseAPI!: () => ITokenBaseAPI<"general">;

    constructor(
      readonly id: string,
      readonly key: string,
      readonly user: string,
      readonly date: Date,
    ) {
      super(TokenBaseTest);
    }
  }
  applyMixins(TokenBaseTest, [TokenBase]);

  const clientID = new ObjectID().toHexString();
  const userID = new ObjectID().toHexString();
  const tokenID = new ObjectID().toHexString();
  const tokenGeneral = new TokenGeneral(
    tokenID,
    "key",
    clientID,
    userID,
    Im.List(),
    new Date(300),
  );

  describe("fromTokenBase", () => {
    it("正常に変換できるか", () => {
      const tokenID = new ObjectID().toHexString();
      const userID = new ObjectID().toHexString();
      const token = new TokenBaseTest(tokenID, "key", userID, new Date(0));
      expect(fromTokenBase<"general">()(token)).toEqual({
        _id: new ObjectID(tokenID),
        key: "key",
        user: new ObjectID(userID),
        date: new Date(0),
        type: "general",
      });
    });
  });

  describe("toTokenGeneral", () => {
    it("正常に変換出来るか", () => {
      expect(
        toTokenGeneral({
          _id: new ObjectID(tokenID),
          key: "key",
          type: "general",
          client: new ObjectID(clientID),
          user: new ObjectID(userID),
          date: new Date(300),
          req: [],
        }),
      ).toEqual(tokenGeneral);
    });
  });

  describe("fromTokenGeneral", () => {
    it("正常に変換出来るか", () => {
      expect(fromTokenGeneral(tokenGeneral)).toEqual({
        ...fromTokenBase<"general">()(tokenGeneral),
        client: new ObjectID(clientID),
        req: [],
      });
    });
  });

  const tokenMaster = new TokenMaster(tokenID, "key", userID, new Date(0));

  describe("toTokenMaster", () => {
    it("正常に変換出来るか", () => {
      expect(
        toTokenMaster({
          _id: new ObjectID(tokenID),
          key: "key",
          type: "master",
          user: new ObjectID(userID),
          date: new Date(0),
        }),
      ).toEqual(tokenMaster);
    });
  });

  describe("tokenMaster", () => {
    it("正常に変換出来るか", () => {
      const db = fromTokenMaster(tokenMaster);
      expect(db).toEqual(fromTokenBase<"master">()(tokenMaster));
    });
  });
});
