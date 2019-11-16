import { none, some } from "fp-ts/lib/Option";
import * as Im from "immutable";
import { DummyObjectIdGenerator, History, User } from "../../";
import { IAuthToken } from "../../auth";

describe("History", () => {
  describe("create", () => {
    it("正常に作れるか", () => {
      const user = new User(
        "user",
        "sn",
        "pass",
        5,
        {
          last: new Date(200),
          m10: 0,
          m30: 0,
          h1: 0,
          h6: 0,
          h12: 0,
          d1: 0,
        },
        new Date(80),
        new Date(20),
        0,
        new Date(90),
      );

      expect(
        History.create(
          new DummyObjectIdGenerator("history"),
          "topic",
          "title",
          [],
          "text",
          new Date(300),
          "hash",
          user,
        ),
      ).toEqual(
        new History(
          "history",
          "topic",
          "title",
          Im.List(),
          "text",
          new Date(300),
          "hash",
          "user",
        ),
      );
    });
  });

  const history = new History(
    "history",
    "topic",
    "title",
    Im.List("x"),
    "text",
    new Date(0),
    "hash",
    "user",
  );

  describe("#toAPI", () => {
    it("正常に変換できるか(tokenがnull)", () => {
      expect(history.toAPI(none)).toEqual({
        id: "history",
        topicID: "topic",
        title: "title",
        tags: ["x"],
        text: "text",
        date: new Date(0).toISOString(),
        hash: "hash",
        self: null,
      });
    });

    it("正常に変換できるか(tokenが投稿ユーザー)", () => {
      expect(
        history.toAPI(
          some<IAuthToken>({
            id: "token",
            key: "key",
            user: "user",
            type: "master",
          }),
        ),
      ).toEqual({
        id: "history",
        topicID: "topic",
        title: "title",
        tags: ["x"],
        text: "text",
        date: new Date(0).toISOString(),
        hash: "hash",
        self: true,
      });
    });

    it("正常に変換できるか(tokenが別ユーザー)", () => {
      expect(
        history.toAPI(
          some<IAuthToken>({
            id: "token",
            key: "key",
            user: "user2",
            type: "master",
          }),
        ),
      ).toEqual({
        id: "history",
        topicID: "topic",
        title: "title",
        tags: ["x"],
        text: "text",
        date: new Date(0).toISOString(),
        hash: "hash",
        self: false,
      });
    });
  });
});
