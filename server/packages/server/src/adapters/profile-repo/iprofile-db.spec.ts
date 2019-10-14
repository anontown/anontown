import { ObjectID } from "mongodb";
import { Profile } from "../../entities";
import { fromProfile, toProfile } from "./jprofile-db";

describe("IProfileDB", () => {
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

  describe("fromProfile", () => {
    it("正常に変換できるか", () => {
      expect(fromProfile(profile)).toEqual({
        _id: new ObjectID(profileID),
        user: new ObjectID(userID),
        name: "name",
        text: "text",
        date: new Date(0),
        update: new Date(100),
        sn: "sn",
      });
    });
  });

  describe("toProfile", () => {
    it("正常に作成できるか", () => {
      expect(
        toProfile({
          _id: new ObjectID(profileID),
          user: new ObjectID(userID),
          name: "name",
          text: "text",
          date: new Date(0),
          update: new Date(100),
          sn: "sn",
        }),
      ).toEqual(profile);
    });
  });
});
