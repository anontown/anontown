import * as Im from "immutable";
import { IAuthTokenMaster, ResTopic, TopicOne, User } from "../../";
import { DummyObjectIdGenerator } from "../../adapters";

describe("TopicOne", () => {
  const topic = new TopicOne(
    "topic",
    "title",
    Im.List(),
    "text",
    new Date(100),
    new Date(0),
    5,
    new Date(50),
    true,
  );

  const user = new User(
    "user",
    "sn",
    "pass",
    10,
    {
      last: new Date(0),
      m10: 0,
      m30: 0,
      h1: 0,
      h6: 0,
      h12: 0,
      d1: 0,
    },
    new Date(0),
    new Date(0),
    0,
    new Date(0),
  );

  const auth: IAuthTokenMaster = {
    id: "token",
    key: "key",
    user: "user",
    type: "master",
  };

  describe("create", () => {
    it("正常に生成できるか", () => {
      expect(
        TopicOne.create(
          new DummyObjectIdGenerator("id"),
          "title",
          [],
          "text",
          user,
          auth,
          new Date(24 * 60 * 60 * 1000),
        ),
      ).toEqual({
        topic: topic.copy({
          resCount: 1,
          id: "id",
          date: new Date(24 * 60 * 60 * 1000),
          update: new Date(24 * 60 * 60 * 1000),
          ageUpdate: new Date(24 * 60 * 60 * 1000),
        }),
        res: new ResTopic(
          "id",
          "id",
          new Date(24 * 60 * 60 * 1000),
          "user",
          Im.List(),
          50,
          topic.copy({ id: "id" }).hash(new Date(24 * 60 * 60 * 1000), user),
          0,
        ),
        user: user.copy({ lastOneTopic: new Date(24 * 60 * 60 * 1000) }),
      });
    });
  });
});
