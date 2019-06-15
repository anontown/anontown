import { none, Option, some } from "fp-ts/lib/Option";
import * as Im from "immutable";
import {
  AtError,
  IAuthToken,
  IResBaseAPI,
  IResBaseDB,
  IVote,
  ResBase,
  User,
} from "../../";
import { Copyable } from "../../utils";
import { applyMixins } from "../../utils";

describe("ResBase", () => {
  class ResBaseTest extends Copyable<ResBaseTest> implements ResBase<"normal", ResBaseTest> {
    toBaseAPI!: (authToken: Option<IAuthToken>) => IResBaseAPI<"normal">;
    toBaseDB!: <Body extends object>(body: Body) => IResBaseDB<"normal", Body>;
    cv!: (resUser: User, user: User, _authToken: IAuthToken) => { res: ResBaseTest, resUser: User };
    _v!: (resUser: User, user: User, type: "uv" | "dv", _authToken: IAuthToken) => { res: ResBaseTest, resUser: User };
    v!: (resUser: User, user: User, type: "uv" | "dv", _authToken: IAuthToken) => { res: ResBaseTest, resUser: User };

    readonly type: "normal" = "normal";

    constructor(
      readonly id: string,
      readonly topic: string,
      readonly date: Date,
      readonly user: string,
      readonly votes: Im.List<IVote>,
      readonly lv: number,
      readonly hash: string,
      readonly replyCount: number) {
      super(ResBaseTest);
    }
  }
  applyMixins(ResBaseTest, [ResBase]);

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
    new Date(300),
    new Date(10),
    0,
    new Date(200));

  const token: IAuthToken = {
    id: "token",
    key: "key",
    user: "user",
    type: "master",
  };

  const res = new ResBaseTest("id",
    "topic",
    new Date(0),
    "user",
    Im.List(),
    1,
    "hash",
    10);

  describe("#v", () => {
    it("正常に投票出来るか", () => {
      const voteUser = user.copy({ id: "voteuser", lv: 100 });
      const { res: newRes, resUser: newResUser } = res.v(user,
        voteUser,
        "uv",
        { ...token, user: "voteuser" });

      expect(newRes).toEqual(res.copy({ votes: Im.List([{ user: voteUser.id, value: 2 }]) }));
      expect(newResUser).toEqual(user.copy({ lv: 3 }));

      const voteUser2 = voteUser.copy({ id: "voteuser2", lv: 50 });
      const { res: newNewRes, resUser: newNewResUser } = newRes.v(newResUser,
        voteUser2,
        "dv",
        { ...token, user: "voteuser2" });

      expect(newNewRes).toEqual(newRes.copy({
        votes: Im.List([
          { user: voteUser.id, value: 2 },
          { user: voteUser2.id, value: -1 }]),
      }));
      expect(newNewResUser).toEqual(newResUser.copy({ lv: 2 }));
    });

    it("自分に投票するとエラーになるか", () => {
      expect(() => {
        res.v(user,
          user,
          "uv",
          token);
      }).toThrow(AtError);
    });

    it("異なる重複投票を正常に出来るか", () => {
      {
        const votedRes = res.copy({ votes: Im.List([{ user: "voteuser", value: 2 }]) });
        const voteUser = user.copy({ id: "voteuser" });
        const auth = { ...token, user: "voteuser" };
        const data = votedRes.cv(user, voteUser, auth);

        expect(votedRes.v(user, voteUser, "dv", auth)).toEqual(data.res.v(data.resUser, voteUser, "dv", auth));
      }

      {
        const votedRes = res.copy({ votes: Im.List([{ user: "voteuser", value: -2 }]) });
        const voteUser = user.copy({ id: "voteuser" });
        const auth = { ...token, user: "voteuser" };
        const data = votedRes.cv(user, voteUser, auth);

        expect(votedRes.v(user, voteUser, "uv", auth)).toEqual(data.res.v(data.resUser, voteUser, "uv", auth));
      }
    });

    it("同様の重複投票でエラーになるか", () => {
      {
        const votedRes = res.copy({ votes: Im.List([{ user: "voteuser", value: 2 }]) });
        const voteUser = user.copy({ id: "voteuser" });

        expect(() => {
          votedRes.v(user, voteUser, "uv", { ...token, user: "voteuser" });
        }).toThrow(AtError);
      }

      {
        const votedRes = res.copy({ votes: Im.List([{ user: "voteuser", value: -2 }]) });
        const voteUser = user.copy({ id: "voteuser" });

        expect(() => {
          votedRes.v(user, voteUser, "dv", { ...token, user: "voteuser" });
        }).toThrow(AtError);
      }
    });
  });

  describe("#cv", () => {
    it("正常にcv出来るか", () => {
      const votedRes = res.copy({ votes: Im.List([{ user: "voteuser", value: 2 }]) });
      const resUser = user.copy({ lv: 5 });
      const voteUser = user.copy({ id: "voteuser" });
      const { res: newRes, resUser: newResUser }
        = votedRes.cv(resUser, voteUser, { ...token, user: "voteuser" });

      expect(newRes).toEqual(res.copy({ votes: Im.List() }));
      expect(newResUser).toEqual(resUser.copy({ lv: 3 }));
    });

    it("投票していない時エラーになるか", () => {
      const votedRes = res.copy({ votes: Im.List([{ user: "voteuser", value: 2 }]) });
      const resUser = user.copy({ lv: 5 });
      const voteUser = user.copy({ id: "voteuser2" });
      expect(() => {
        votedRes.cv(resUser, voteUser, { ...token, user: "voteuser2" });
      }).toThrow(AtError);
    });
  });

  describe("#toBaseDB", () => {
    it("正常に変換出来るか", () => {
      const db = res.toBaseDB({});
      expect(db).toEqual({
        id: res.id,
        body: {
          type: res.type,
          topic: res.topic,
          date: res.date.toISOString(),
          user: res.user,
          votes: res.votes.toArray(),
          lv: res.lv,
          hash: res.hash,
        },
      });
    });
  });

  describe("#toBaseAPI", () => {
    it("tokenがnullの時", () => {
      const api = res.toBaseAPI(none);
      expect(api).toEqual({
        id: res.id,
        topicID: res.topic,
        date: res.date,
        self: null,
        uv: 0,
        dv: 0,
        hash: res.hash,
        replyCount: res.replyCount,
        voteFlag: null,
        type: res.type,
      });
    });

    it("tokenが投稿ユーザーの時", () => {
      const api = res.toBaseAPI(some(token));
      expect(api).toEqual({
        id: res.id,
        topicID: res.topic,
        date: res.date,
        self: true,
        uv: 0,
        dv: 0,
        hash: res.hash,
        replyCount: res.replyCount,
        voteFlag: "not",
        type: res.type,
      });
    });

    it("tokenが投稿ユーザーでない時", () => {
      const api = res.copy({
        votes: Im.List([{ user: "user2", value: -2 }]),
      }).toBaseAPI(some({ ...token, user: "user1" }));
      expect(api).toEqual({
        id: res.id,
        topicID: res.topic,
        date: res.date,
        self: false,
        uv: 0,
        dv: 1,
        hash: res.hash,
        replyCount: res.replyCount,
        voteFlag: "not",
        type: res.type,
      });
    });

    it("uvした時", () => {
      const api = res.copy({
        votes: Im.List([{ user: "user2", value: -2 }, { user: "user1", value: 5 }]),
      })
        .toBaseAPI(some({ ...token, user: "user1" }));

      expect(api).toEqual({
        id: res.id,
        topicID: res.topic,
        date: res.date,
        self: false,
        uv: 1,
        dv: 1,
        hash: res.hash,
        replyCount: res.replyCount,
        voteFlag: "uv",
        type: res.type,
      });
    });

    it("dvした時", () => {
      const api = res.copy({
        votes: Im.List([{ user: "user1", value: -1 }, { user: "user2", value: 1 }]),
      })
        .toBaseAPI(some({ ...token, user: "user1" }));

      expect(api).toEqual({
        id: res.id,
        topicID: res.topic,
        date: res.date,
        self: false,
        uv: 1,
        dv: 1,
        hash: res.hash,
        replyCount: res.replyCount,
        voteFlag: "dv",
        type: res.type,
      });
    });
  });
});
