import { some } from "fp-ts/lib/Option";
import { Msg } from "../../entities";
import { fromMsg, toMsg } from "./imsg-db";

describe("IMsgDB", () => {
  const msg = new Msg("msg", some("user"), "text", new Date(0));

  describe("fromMsg", () => {
    it("正常に変換出来るか", () => {
      expect(fromMsg(msg)).toEqual({
        id: "msg",
        body: {
          receiver: "user",
          text: "text",
          date: new Date(0).toISOString(),
        },
      });
    });
  });

  describe("toMsg", () => {
    it("正常に作成できるか", () => {
      expect(
        toMsg({
          id: "msg",
          body: {
            receiver: "user",
            text: "text",
            date: new Date(0).toISOString(),
          },
        }),
      ).toEqual(msg);
    });
  });
});
