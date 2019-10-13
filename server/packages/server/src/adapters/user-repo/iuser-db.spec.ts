import { ObjectID } from "mongodb";
import { Config } from "../../config";
import { User } from "../../entities";
import { hash } from "../../utils/hash";
import { fromUser, toUser } from "./iuser-db";

describe("IUserDB", () => {
  const userID = new ObjectID().toHexString();
  const user = new User(
    userID,
    "scn",
    hash("pass" + Config.salt.pass),
    1,
    {
      last: new Date(300),
      m10: 0,
      m30: 0,
      h1: 0,
      h6: 0,
      h12: 0,
      d1: 0,
    },
    new Date(100),
    new Date(0),
    0,
    new Date(150),
  );

  describe("toUser", () => {
    it("正常に変換出来るか", () => {
      expect(
        toUser({
          _id: new ObjectID(userID),
          sn: "scn",
          pass: hash("pass" + Config.salt.pass),
          lv: 1,
          resWait: {
            last: new Date(300),
            m10: 0,
            m30: 0,
            h1: 0,
            h6: 0,
            h12: 0,
            d1: 0,
          },
          lastTopic: new Date(100),
          date: new Date(0),
          point: 0,
          lastOneTopic: new Date(150),
        }),
      ).toEqual(user);
    });
  });

  describe("fromUser", () => {
    it("正常に変換出来るか", () => {
      expect(fromUser(user)).toEqual({
        _id: new ObjectID(userID),
        sn: "scn",
        pass: hash("pass" + Config.salt.pass),
        lv: 1,
        resWait: {
          last: new Date(300),
          m10: 0,
          m30: 0,
          h1: 0,
          h6: 0,
          h12: 0,
          d1: 0,
        },
        lastTopic: new Date(100),
        date: new Date(0),
        point: 0,
        lastOneTopic: new Date(150),
      });
    });
  });
});
