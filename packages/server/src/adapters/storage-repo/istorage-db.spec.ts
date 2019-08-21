import { none, some } from "fp-ts/lib/Option";
import { ObjectID } from "mongodb";
import { Storage } from "../../entities";
import { fromStorage, toStorage } from "./isotrage-db";

describe("IStorageDB", () => {
  const cleintID = new ObjectID().toHexString();
  const userID = new ObjectID().toHexString();

  const storage = new Storage(some(cleintID), userID, "key", "value");

  describe("toStorage", () => {
    it("正常に変換出来るか", () => {
      expect(
        toStorage({
          client: new ObjectID(cleintID),
          user: new ObjectID(userID),
          key: "key",
          value: "value",
        }),
      ).toEqual(storage);

      expect(
        toStorage({
          client: null,
          user: new ObjectID(userID),
          key: "key",
          value: "value",
        }),
      ).toEqual(storage.copy({ client: none }));
    });
  });

  describe("fromStorage", () => {
    it("正常に変換出来るか", () => {
      expect(fromStorage(storage)).toEqual({
        client: new ObjectID(cleintID),
        user: new ObjectID(userID),
        key: "key",
        value: "value",
      });

      expect(fromStorage(storage.copy({ client: none }))).toEqual({
        client: null,
        user: new ObjectID(userID),
        key: "key",
        value: "value",
      });
    });
  });
});
