import * as Im from "immutable";
import { History } from "../../entities";
import { fromHistory, toHistory } from "./ihistory-db";

describe("IHistoryDB", () => {
  describe("toHistory", () => {
    it("正常に変換出来るか", () => {
      expect(
        toHistory({
          id: "history",
          body: {
            topic: "topic",
            title: "title",
            tags: ["x"],
            text: "text",
            date: new Date(0).toISOString(),
            hash: "hash",
            user: "user",
          },
        }),
      ).toEqual(
        new History(
          "history",
          "topic",
          "title",
          Im.List(["x"]),
          "text",
          new Date(0),
          "hash",
          "user",
        ),
      );
    });
  });

  describe("fromHistory", () => {
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

    it("正常に変換できるか", () => {
      expect(fromHistory(history)).toEqual({
        id: "history",
        body: {
          topic: "topic",
          title: "title",
          tags: ["x"],
          text: "text",
          date: new Date(0).toISOString(),
          hash: "hash",
          user: "user",
        },
      });
    });
  });
});
