import { none, some } from "fp-ts/lib/Option";
import { ObjectID } from "mongodb";
import { DummyObjectIdGenerator, IAuthTokenMaster, Profile } from "../../";

describe("Profile", () => {
  const profileID = new ObjectID().toHexString();
  const userID = new ObjectID().toHexString();
  const profile = new Profile(
    profileID,
    userID,
    "name",
    "text",
    new Date(0),
    new Date(100),
    "sn",
  );

  const auth: IAuthTokenMaster = {
    type: "master",
    user: userID,
    key: "key",
    id: new ObjectID().toHexString(),
  };

  describe("#toAPI", () => {
    it("認証あり(同一ユーザー)", () => {
      expect(profile.toAPI(some(auth))).toEqual({
        id: profileID,
        self: true,
        name: "name",
        text: "text",
        date: new Date(0).toISOString(),
        update: new Date(100).toISOString(),
        sn: "sn",
      });
    });

    it("認証あり(別ユーザー)", () => {
      expect(
        profile.toAPI(
          some({
            ...auth,
            user: new ObjectID().toHexString(),
          }),
        ),
      ).toEqual({
        id: profileID,
        self: false,
        name: "name",
        text: "text",
        date: new Date(0).toISOString(),
        update: new Date(100).toISOString(),
        sn: "sn",
      });
    });

    it("認証なし", () => {
      expect(profile.toAPI(none)).toEqual({
        id: profileID,
        self: null,
        name: "name",
        text: "text",
        date: new Date(0).toISOString(),
        update: new Date(100).toISOString(),
        sn: "sn",
      });
    });
  });
  // TODO: createの異常系とchangeDataのテスト
  describe("create", () => {
    it("正常に作れるか", () => {
      expect(
        Profile.create(
          new DummyObjectIdGenerator(profileID),
          auth,
          "name",
          "text",
          "scn",
          new Date(0),
        ),
      ).toEqual(profile.copy({ update: new Date(0), sn: "scn" }));
    });
  });
});
