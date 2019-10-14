import { none, some } from "fp-ts/lib/Option";
import {
  AtError,
  DummyObjectIdGenerator,
  IAuthTokenMaster,
  Msg,
  User,
} from "../../";

describe("Msg", () => {
  const msg = new Msg("msg", some("user"), "text", new Date(0));
  const receiverNullMsg = new Msg("msg", none, "text", new Date(0));
  const auth: IAuthTokenMaster = {
    id: "token",
    key: "key",
    user: "user",
    type: "master",
  };

  describe("#toAPI", () => {
    it("正常に変換出来るか", () => {
      expect(msg.toAPI(auth)).toEqual({
        id: "msg",
        priv: true,
        text: "text",
        date: new Date(0).toISOString(),
      });
    });

    it("receiverがnull", () => {
      expect(receiverNullMsg.toAPI(auth)).toEqual({
        id: "msg",
        priv: false,
        text: "text",
        date: new Date(0).toISOString(),
      });
    });

    it("receiverがnot nullかつユーザーが違う時エラーになるか", () => {
      expect(() => {
        msg.toAPI({ ...auth, user: "user2" });
      }).toThrow(AtError);
    });
  });

  describe("create", () => {
    it("receiverがnullの時正常に生成できるか", () => {
      expect(
        Msg.create(
          new DummyObjectIdGenerator("msg"),
          none,
          "text",
          new Date(0),
        ),
      ).toEqual(receiverNullMsg);
    });

    it("receiverがnullでない時正常に生成出来るか", () => {
      const user = new User(
        "user",
        "sn",
        "pass",
        1,
        {
          last: new Date(100),
          m10: 0,
          m30: 0,
          h1: 0,
          h6: 0,
          h12: 0,
          d1: 0,
        },
        new Date(200),
        new Date(20),
        0,
        new Date(250),
      );
      expect(
        Msg.create(
          new DummyObjectIdGenerator("msg"),
          some(user),
          "text",
          new Date(0),
        ),
      ).toEqual(msg);
    });
  });
});
