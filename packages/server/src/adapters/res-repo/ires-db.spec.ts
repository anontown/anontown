import { option } from "fp-ts";
import { some } from "fp-ts/lib/Option";
import * as Im from "immutable";
import { ResFork, ResHistory, ResNormal, ResTopic } from "../../entities";
import {
  fromResBase,
  fromResFork,
  fromResHistory,
  fromResNormal,
  fromResTopic,
  toResFork,
  toResHistory,
  toResNormal,
  toResTopic,
} from "./ires-db";

describe("IResDB", () => {
  describe("toResFork", () => {
    it("正常に作れるか", () => {
      expect(
        toResFork(
          {
            id: "id",
            body: {
              type: "fork",
              topic: "topic",
              date: new Date(400).toISOString(),
              user: "user",
              votes: [],
              lv: 5,
              hash: "hash",
              fork: "topicfork",
            },
          },
          3,
        ),
      ).toEqual(
        new ResFork(
          "topicfork",
          "id",
          "topic",
          new Date(400),
          "user",
          Im.List(),
          5,
          "hash",
          3,
        ),
      );
    });
  });

  describe("fromResFork", () => {
    const resFork = new ResFork(
      "topicfork",
      "res",
      "topic",
      new Date(500),
      "user",
      Im.List(),
      5,
      "hash",
      10,
    );

    it("正常に変換出来るか", () => {
      expect(fromResFork(resFork)).toEqual(
        fromResBase<"fork">()(resFork, { fork: "topicfork" }),
      );
    });
  });

  describe("toResNormal", () => {
    it("正常に変換出来るか", () => {
      expect(
        toResNormal(
          {
            id: "res",
            body: {
              type: "normal",
              topic: "topic",
              date: new Date(100).toISOString(),
              user: "user",
              votes: [],
              lv: 10,
              hash: "hash",
              name: "name",
              text: "text",
              reply: {
                res: "replyres",
                user: "replyuser",
              },
              deleteFlag: "active",
              profile: "profile",
              age: true,
            },
          },
          2,
        ),
      ).toEqual(
        new ResNormal(
          some("name"),
          "text",
          some({
            res: "replyres",
            user: "replyuser",
          }),
          "active",
          some("profile"),
          true,
          "res",
          "topic",
          new Date(100),
          "user",
          Im.List(),
          10,
          "hash",
          2,
        ),
      );
    });
  });

  describe("fromResNormal", () => {
    const resNormal = new ResNormal(
      some("name"),
      "text",
      some({
        res: "replyres",
        user: "replyuser",
      }),
      "active",
      some("profile"),
      true,
      "res",
      "topic",
      new Date(60),
      "user",
      Im.List(),
      5,
      "hash",
      1,
    );

    it("正常に変換出来るか", () => {
      expect(fromResNormal(resNormal)).toEqual({
        id: resNormal.id,
        body: {
          type: resNormal.type,
          topic: resNormal.topic,
          date: resNormal.date.toISOString(),
          user: resNormal.user,
          votes: resNormal.votes.toArray(),
          lv: resNormal.lv,
          hash: resNormal.hash,
          name: option.toNullable(resNormal.name),
          text: resNormal.text,
          reply: option.toNullable(resNormal.reply),
          deleteFlag: resNormal.deleteFlag,
          profile: option.toNullable(resNormal.profile),
          age: resNormal.age,
        },
      });
    });
  });

  describe("toResTopic", () => {
    it("正常に作れるか", () => {
      expect(
        toResTopic(
          {
            id: "id",
            body: {
              type: "topic",
              topic: "topic",
              date: new Date(100).toISOString(),
              user: "user",
              votes: [],
              lv: 5,
              hash: "hash",
            },
          },
          3,
        ),
      ).toEqual(
        new ResTopic(
          "id",
          "topic",
          new Date(100),
          "user",
          Im.List(),
          5,
          "hash",
          3,
        ),
      );
    });
  });

  describe("fromResTopic", () => {
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

    it("正常に変換出来るか", () => {
      expect(fromResTopic(resTopic)).toEqual(fromResBase()(resTopic, {}));
    });
  });

  describe("toResHistory", () => {
    it("正常に作れるか", () => {
      expect(
        toResHistory(
          {
            id: "id",
            body: {
              type: "history",
              topic: "topic",
              date: new Date(1000).toISOString(),
              user: "user",
              votes: [],
              lv: 5,
              hash: "hash",
              history: "history",
            },
          },
          3,
        ),
      ).toEqual(
        new ResHistory(
          "history",
          "id",
          "topic",
          new Date(1000),
          "user",
          Im.List(),
          5,
          "hash",
          3,
        ),
      );
    });
  });

  describe("fromResHistory", () => {
    const resHistory = new ResHistory(
      "history",
      "res",
      "topic",
      new Date(700),
      "user",
      Im.List(),
      5,
      "hash",
      1,
    );

    it("正常に変換できるか", () => {
      expect(fromResHistory(resHistory)).toEqual(
        fromResBase()(resHistory, {
          history: resHistory.history,
        }),
      );
    });
  });
});
