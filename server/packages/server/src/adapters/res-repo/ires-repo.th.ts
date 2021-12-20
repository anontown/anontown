import { none, some } from "fp-ts/lib/Option";
import * as Im from "immutable";
import {
  AtError,
  AuthContainer,
  IAuthTokenMaster,
  IResRepo,
  ResFork,
  ResHistory,
  ResNormal,
  ResTopic,
} from "../../";

export function run(
  $isolate: (callback: (repo: IResRepo) => Promise<void>) => Promise<void>,
) {
  const resNormal = new ResNormal(
    some("name"),
    "text",
    none,
    "active",
    none,
    true,
    "res",
    "topic",
    new Date(0),
    "user",
    Im.List(),
    5,
    "hash",
    0,
  );

  const resHistory = new ResHistory(
    "history",
    "res",
    "topic",
    new Date(0),
    "user",
    Im.List(),
    5,
    "hash",
    0,
  );

  const resTopic = new ResTopic(
    "res",
    "topic",
    new Date(0),
    "user",
    Im.List(),
    5,
    "hash",
    0,
  );

  const resFork = new ResFork(
    "topicfork",
    "res",
    "topic",
    new Date(0),
    "user",
    Im.List(),
    5,
    "hash",
    0,
  );

  describe("findOne", () => {
    it("正常に探せるか", async () => {
      await $isolate(async repo => {
        const res1 = resNormal.copy({ id: "res1" });
        const res2 = resHistory.copy({ id: "res2" });
        const res3 = resTopic.copy({ id: "res3" });
        const res4 = resFork.copy({ id: "res4" });

        await repo.insert(res1);
        await repo.insert(res2);
        await repo.insert(res3);
        await repo.insert(res4);

        expect(await repo.findOne(res1.id)).toEqual(res1);
        expect(await repo.findOne(res2.id)).toEqual(res2);
        expect(await repo.findOne(res3.id)).toEqual(res3);
        expect(await repo.findOne(res4.id)).toEqual(res4);
      });
    });

    it("存在しない時エラーになるか", async () => {
      await $isolate(async repo => {
        await repo.insert(resNormal);

        await expect(repo.findOne("res2")).rejects.toThrow(AtError);
      });
    });
  });

  describe("insert", () => {
    it("正常に検索できるか", async () => {
      await $isolate(async repo => {
        await repo.insert(resNormal);

        expect(await repo.findOne(resNormal.id)).toEqual(resNormal);
      });
    });

    // TODO:ID被り
  });

  describe("update", () => {
    it("正常に更新出来るか", async () => {
      await $isolate(async repo => {
        const res1 = resNormal.copy({ id: "res1" });
        const res2 = resTopic.copy({ id: "res2" });
        const res3 = resFork.copy({ id: "res4" });
        const res4 = resHistory.copy({ id: "res5" });

        const res1update = res1.copy({ text: "update" });
        const res2update = res2.copy({ topic: "update" });
        const res3update = res3.copy({ fork: "update" });
        const res4update = res4.copy({ history: "update" });

        await repo.insert(res1);
        await repo.insert(res2);
        await repo.insert(res3);
        await repo.insert(res4);

        await repo.update(res1update);

        expect(await repo.findOne(res2.id)).toEqual(res2);

        await repo.update(res2update);
        await repo.update(res3update);
        await repo.update(res4update);

        expect(await repo.findOne(res1.id)).toEqual(res1update);
        expect(await repo.findOne(res2.id)).toEqual(res2update);
        expect(await repo.findOne(res3.id)).toEqual(res3update);
        expect(await repo.findOne(res4.id)).toEqual(res4update);
      });
    });

    // TODO:存在しないID
  });

  describe("find", () => {
    const notAuth = new AuthContainer(none);
    it("正常に検索できるか", async () => {
      await $isolate(async repo => {
        const token: IAuthTokenMaster = {
          id: "token",
          key: "key",
          user: "user",
          type: "master",
        };

        const auth = new AuthContainer(some(token));
        const user2Auth = new AuthContainer(some({ ...token, user: "user2" }));

        const res1 = resNormal.copy({ id: "res1", date: new Date(50) });
        const res2 = resTopic.copy({
          id: "res2",
          date: new Date(80),
          topic: "topic2",
        });
        const res3 = resFork.copy({
          id: "res3",
          date: new Date(30),
          user: "user2",
        });
        const res4 = resHistory.copy({
          id: "res4",
          date: new Date(90),
          hash: "hash2",
        });
        const res5 = resNormal.copy({
          id: "res5",
          date: new Date(20),
          profile: some("p1"),
        });
        const res6 = resTopic.copy({
          id: "res6",
          date: new Date(10),
          replyCount: 1,
        });
        const res7 = resNormal.copy({
          id: "res7",
          date: new Date(60),
          text: "abc",
          reply: some({ user: "user", res: "res6" }),
        });
        const res8 = resHistory.copy({ id: "res8", date: new Date(40) });
        const res9 = resFork.copy({ id: "res9", date: new Date(70) });

        await repo.insert(res1);
        await repo.insert(res2);
        await repo.insert(res3);
        await repo.insert(res4);
        await repo.insert(res5);
        await repo.insert(res6);
        await repo.insert(res7);
        await repo.insert(res8);
        await repo.insert(res9);

        // 無
        expect(await repo.find(notAuth, {}, 100)).toEqual([
          res4,
          res2,
          res9,
          res7,
          res1,
          res8,
          res3,
          res5,
          res6,
        ]);

        expect(await repo.find(notAuth, {}, 3)).toEqual([res4, res2, res9]);

        // topic
        expect(await repo.find(notAuth, { topic: "topic2" }, 100)).toEqual([
          res2,
        ]);

        // notice
        expect(
          await repo.find(
            auth,
            {
              notice: true,
            },
            100,
          ),
        ).toEqual([res7]);

        expect(await repo.find(notAuth, { notice: false }, 100)).toEqual([
          res4,
          res2,
          res9,
          res7,
          res1,
          res8,
          res3,
          res5,
          res6,
        ]);

        // hash
        expect(
          await repo.find(
            notAuth,
            {
              hash: "hash2",
            },
            100,
          ),
        ).toEqual([res4]);

        // reply
        expect(
          await repo.find(
            notAuth,
            {
              reply: "res6",
            },
            100,
          ),
        ).toEqual([res7]);

        // profile
        expect(
          await repo.find(
            notAuth,
            {
              profile: "p1",
            },
            100,
          ),
        ).toEqual([res5]);

        // text
        expect(
          await repo.find(
            notAuth,
            {
              text: "abc",
            },
            100,
          ),
        ).toEqual([res7]);

        // self
        expect(
          await repo.find(
            user2Auth,
            {
              self: true,
            },
            100,
          ),
        ).toEqual([res3]);

        expect(await repo.find(notAuth, { self: false }, 100)).toEqual([
          res4,
          res2,
          res9,
          res7,
          res1,
          res8,
          res3,
          res5,
          res6,
        ]);

        // date
        expect(
          await repo.find(
            notAuth,
            {
              date: {
                type: "gte",
                date: new Date(80).toISOString(),
              },
            },
            100,
          ),
        ).toEqual([res4, res2]);

        expect(
          await repo.find(
            notAuth,
            {
              date: {
                type: "gt",
                date: new Date(80).toISOString(),
              },
            },
            100,
          ),
        ).toEqual([res4]);

        expect(
          await repo.find(
            notAuth,
            {
              date: {
                type: "lte",
                date: new Date(20).toISOString(),
              },
            },
            100,
          ),
        ).toEqual([res5, res6]);

        expect(
          await repo.find(
            notAuth,
            {
              date: {
                type: "lt",
                date: new Date(20).toISOString(),
              },
            },
            100,
          ),
        ).toEqual([res6]);

        // 複合
        expect(
          await repo.find(
            notAuth,
            {
              date: {
                type: "lte",
                date: new Date(20).toISOString(),
              },
              id: ["res5", "res1"],
            },
            100,
          ),
        ).toEqual([res5]);
      });
    });

    it("通知フィルタでトークンがないとエラーになるか", async () => {
      await $isolate(async repo => {
        await expect(
          repo.find(
            notAuth,
            {
              notice: true,
            },
            10,
          ),
        ).rejects.toThrow(AtError);
      });
    });

    it("selfフィルタでトークンがないとエラーになるか", async () => {
      await $isolate(async repo => {
        await expect(
          repo.find(
            notAuth,
            {
              self: true,
            },
            10,
          ),
        ).rejects.toThrow(AtError);
      });
    });
  });
}
