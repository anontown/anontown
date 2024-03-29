import { none, some } from "fp-ts/lib/Option";
import { ObjectID } from "bson";
import { AtError, AuthContainer, IProfileRepo, Profile } from "../../";
import { IAuthToken } from "../../auth";

export function run(
  $isolate: (callback: (repo: IProfileRepo) => Promise<void>) => Promise<void>,
) {
  const profile = new Profile(
    new ObjectID().toHexString(),
    new ObjectID().toHexString(),
    "name",
    "text",
    new Date(0),
    new Date(10),
    "sn",
  );

  describe("findOne", () => {
    it("正常に探せるか", async () => {
      await $isolate(async repo => {
        await repo.insert(profile);
        await repo.insert(
          profile.copy({ id: new ObjectID().toHexString(), sn: "sn2" }),
        );

        expect(await repo.findOne(profile.id)).toEqual(profile);
      });
    });

    it("存在しない時エラーになるか", async () => {
      await $isolate(async repo => {
        await repo.insert(
          new Profile(
            new ObjectID().toHexString(),
            new ObjectID().toHexString(),
            "name",
            "text",
            new Date(0),
            new Date(10),
            "sn",
          ),
        );

        await expect(
          repo.findOne(new ObjectID().toHexString()),
        ).rejects.toThrow(AtError);
      });
    });
  });

  describe("find", () => {
    it("正常に探せるか", async () => {
      await $isolate(async repo => {
        const user1 = new ObjectID().toHexString();
        const user2 = new ObjectID().toHexString();

        const profile1 = profile.copy({
          id: new ObjectID().toHexString(),
          user: user1,
          date: new Date(50),
          sn: "sn1",
        });
        const profile2 = profile.copy({
          id: new ObjectID().toHexString(),
          user: user1,
          date: new Date(80),
          sn: "sn2",
        });
        const profile3 = profile.copy({
          id: new ObjectID().toHexString(),
          user: user1,
          date: new Date(30),
          sn: "sn3",
        });
        const profile4 = profile.copy({
          id: new ObjectID().toHexString(),
          user: user2,
          date: new Date(90),
          sn: "sn4",
        });

        await repo.insert(profile1);
        await repo.insert(profile2);
        await repo.insert(profile3);
        await repo.insert(profile4);

        // id
        expect(await repo.find(new AuthContainer(none), {})).toEqual([
          profile4,
          profile2,
          profile1,
          profile3,
        ]);

        // self
        expect(
          await repo.find(
            new AuthContainer(
              some<IAuthToken>({
                id: new ObjectID().toHexString(),
                key: "key",
                user: user1,
                type: "master",
              }),
            ),
            { self: true },
          ),
        ).toEqual([profile2, profile1, profile3]);

        expect(
          await repo.find(new AuthContainer(none), {
            self: false,
          }),
        ).toEqual([profile4, profile2, profile1, profile3]);

        // id
        expect(await repo.find(new AuthContainer(none), { id: [] })).toEqual(
          [],
        );
        expect(
          await repo.find(new AuthContainer(none), {
            id: [profile1.id, profile2.id, new ObjectID().toHexString()],
          }),
        ).toEqual([profile2, profile1]);

        // 複合
        expect(
          await repo.find(
            new AuthContainer(
              some<IAuthToken>({
                id: new ObjectID().toHexString(),
                key: "key",
                user: user1,
                type: "master",
              }),
            ),
            { self: true, id: [profile1.id, profile2.id, profile4.id] },
          ),
        ).toEqual([profile2, profile1]);
      });
    });

    it("認証していない状態でselfしたらエラーになるか", async () => {
      await $isolate(async repo => {
        await expect(
          repo.find(new AuthContainer(none), { self: true }),
        ).rejects.toThrow(AtError);
      });
    });
  });

  describe("insert", () => {
    it("正常に保存出来るか", async () => {
      await $isolate(async repo => {
        await repo.insert(profile);

        expect(await repo.findOne(profile.id)).toEqual(profile);
      });
    });

    it("sn被りでエラーになるか", async () => {
      await $isolate(async repo => {
        const profile2 = profile.copy({ id: new ObjectID().toHexString() });

        await repo.insert(profile);
        await expect(repo.insert(profile2)).rejects.toThrow(AtError);
      });
    });

    // TODO:ID被り
  });

  describe("update", () => {
    it("正常に更新出来るか", async () => {
      await $isolate(async repo => {
        const profile1 = profile.copy({
          id: new ObjectID().toHexString(),
          sn: "sn1",
        });
        const profile2 = profile.copy({
          id: new ObjectID().toHexString(),
          sn: "sn2",
        });
        const profile1update = profile1.copy({ sn: "update" });
        const profile1update2 = profile1.copy({ name: "newname" });

        await repo.insert(profile1);
        await repo.insert(profile2);

        await repo.update(profile1update);

        expect(await repo.findOne(profile1.id)).toEqual(profile1update);
        expect(await repo.findOne(profile2.id)).toEqual(profile2);

        await repo.update(profile1update2);
        expect(await repo.findOne(profile1.id)).toEqual(profile1update2);
      });
    });

    it("sn被りでエラーになるか", async () => {
      await $isolate(async repo => {
        const profile1 = profile.copy({
          id: new ObjectID().toHexString(),
          sn: "sn1",
        });
        const profile2 = profile.copy({
          id: new ObjectID().toHexString(),
          sn: "sn2",
        });
        const profile1update = profile1.copy({ sn: "sn2" });

        await repo.insert(profile1);
        await repo.insert(profile2);

        await expect(repo.update(profile1update)).rejects.toThrow(AtError);
      });
    });

    // TODO:存在しないID
  });
}
