import * as Im from "immutable";
import {
  History,
  IAuthTokenMaster,
  ResHistory,
  TopicNormal,
  User,
} from "../../";

describe("TopicNormal", () => {
  const topic = new TopicNormal("topic",
    "title",
    Im.List(),
    "text",
    new Date(100),
    new Date(0),
    5,
    new Date(50),
    true);

  const user = new User("user",
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
    new Date(0));

  const auth: IAuthTokenMaster = {
    id: "token",
    key: "key",
    user: "user",
    type: "master",
  };

  describe("create", () => {
    it("正常に生成出来るか", () => {
      expect(TopicNormal.create(() => "topic",
        "title",
        [],
        "text",
        user,
        auth,
        new Date(24 * 60 * 60 * 1000))).toEqual({
          topic: topic.copy({
            date: new Date(24 * 60 * 60 * 1000),
            update: new Date(24 * 60 * 60 * 1000),
            ageUpdate: new Date(24 * 60 * 60 * 1000),
            resCount: 1,
          }),
          history: new History("topic",
            "topic",
            "title",
            Im.List(),
            "text",
            new Date(24 * 60 * 60 * 1000),
            topic.hash(new Date(24 * 60 * 60 * 1000), user),
            "user"),
          res: new ResHistory("topic",
            "topic",
            "topic",
            new Date(24 * 60 * 60 * 1000),
            "user",
            Im.List(),
            50,
            topic.hash(new Date(24 * 60 * 60 * 1000), user),
            0),
          user: user.copy({
            lastTopic: new Date(24 * 60 * 60 * 1000),
            point: 10,
          }),
        });
    });
  });

  describe("fromDB", () => {
    it("正常に生成出来るか", () => {
      expect(TopicNormal.fromDB({
        id: "topic",
        body: {
          type: "normal",
          title: "title",
          update: new Date(100).toISOString(),
          date: new Date(0).toISOString(),
          ageUpdate: new Date(50).toISOString(),
          active: true,
          tags: [],
          text: "text",
        },
      }, 5)).toEqual(topic);
    });
  });

  describe("changeData", () => {
    it("正常に変更出来るか", () => {
      expect(topic.changeData(() => "id",
        user,
        auth,
        "title2",
        ["x"],
        "text2",
        new Date(1000))).toEqual({
          topic: topic.copy({
            update: new Date(1000),
            title: "title2",
            text: "text2",
            tags: Im.List(["x"]),
          }),
          history: new History("id",
            "topic",
            "title2",
            Im.List(["x"]),
            "text2",
            new Date(1000),
            topic.hash(new Date(1000), user),
            "user"),
          res: new ResHistory("id",
            "id",
            "topic",
            new Date(1000),
            "user",
            Im.List(),
            50,
            topic.hash(new Date(1000), user),
            0),
          user: user.copy({
            point: 10,
          }),
        });

      expect(topic.changeData(() => "id",
        user,
        auth,
        undefined,
        ["x"],
        "text2",
        new Date(1000))).toEqual({
          topic: topic.copy({
            update: new Date(1000),
            title: "title",
            text: "text2",
            tags: Im.List(["x"]),
          }),
          history: new History("id",
            "topic",
            "title",
            Im.List(["x"]),
            "text2",
            new Date(1000),
            topic.hash(new Date(1000), user),
            "user"),
          res: new ResHistory("id",
            "id",
            "topic",
            new Date(1000),
            "user",
            Im.List(),
            50,
            topic.hash(new Date(1000), user),
            0),
          user: user.copy({
            point: 10,
          }),
        });

      expect(topic.changeData(() => "id",
        user,
        auth,
        "title2",
        undefined,
        "text2",
        new Date(1000))).toEqual({
          topic: topic.copy({
            update: new Date(1000),
            title: "title2",
            text: "text2",
            tags: Im.List(),
          }),
          history: new History("id",
            "topic",
            "title2",
            Im.List(),
            "text2",
            new Date(1000),
            topic.hash(new Date(1000), user),
            "user"),
          res: new ResHistory("id",
            "id",
            "topic",
            new Date(1000),
            "user",
            Im.List(),
            50,
            topic.hash(new Date(1000), user),
            0),
          user: user.copy({
            point: 10,
          }),
        });
    });
  });
});
