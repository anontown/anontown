import { some } from "fp-ts/lib/Option";
import * as Im from "immutable";
import {
  DummyObjectIdGenerator,
  IAuthToken,
  ResTopic,
  TopicOne,
  User,
} from "../../";

describe("ResTopic", () => {
  const topicOne = new TopicOne(
    "topic",
    "title",
    Im.List(),
    "text",
    new Date(150),
    new Date(100),
    10,
    new Date(200),
    true,
  );

  const user = new User(
    "user",
    "sn",
    "pass",
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
    new Date(10),
    new Date(0),
    0,
    new Date(20),
  );

  const token: IAuthToken = {
    id: "token",
    key: "key",
    user: "user",
    type: "master",
  };

  const resTopic = new ResTopic(
    "res",
    "topic",
    new Date(400),
    "user",
    Im.List(),
    5,
    "hash",
    10,
  );

  describe("create", () => {
    it("正常に作れるか", () => {
      const { res, topic: newTopic } = ResTopic.create(
        new DummyObjectIdGenerator("res"),
        topicOne,
        user,
        token,
        new Date(100),
      );
      expect(res).toEqual(
        new ResTopic(
          "res",
          "topic",
          new Date(100),
          "user",
          Im.List(),
          5,
          topicOne.hash(new Date(100), user),
          0,
        ),
      );

      expect(newTopic).toEqual(topicOne.copy({ update: new Date(100) }));
    });
  });

  describe("toAPI", () => {
    it("正常に変換出来るか", () => {
      expect(resTopic.toAPI(some(token))).toEqual(
        resTopic.toBaseAPI(some(token)),
      );
    });
  });
});
