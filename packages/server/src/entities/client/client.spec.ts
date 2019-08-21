import { none, some } from "fp-ts/lib/Option";
import { ObjectID } from "mongodb";
import { AtError, Client, IAuthTokenMaster } from "../../";
import {
  DummyObjectIdGenerator,
  ObjectIdGenerator,
} from "../../adapters/index";

describe("Client", () => {
  describe("create", () => {
    it("http:// から始まるURLで正常に呼び出せるか", () => {
      expect(
        Client.create(
          new DummyObjectIdGenerator("client"),
          {
            id: "token",
            key: "",
            user: "user",
            type: "master",
          },
          "hoge",
          "http://hoge.com",
          new Date(0),
        ),
      ).toEqual(
        new Client(
          "client",
          "hoge",
          "http://hoge.com",
          "user",
          new Date(0),
          new Date(0),
        ),
      );
    });

    it("https:// から始まるURLで正常に呼び出せるか", () => {
      expect(
        Client.create(
          new DummyObjectIdGenerator("client"),
          {
            id: "token",
            key: "",
            user: "user",
            type: "master",
          },
          "hoge",
          "https://hoge.com",
          new Date(0),
        ),
      ).toEqual(
        new Client(
          "client",
          "hoge",
          "https://hoge.com",
          "user",
          new Date(0),
          new Date(0),
        ),
      );
    });

    it("長い名前でエラーになるか", () => {
      expect(() => {
        Client.create(
          new ObjectIdGenerator(),
          {
            id: new ObjectID().toHexString(),
            key: "",
            user: new ObjectID().toHexString(),
            type: "master",
          },
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          "http://hoge",
          new Date(0),
        );
      }).toThrow(AtError);
    });

    it("名前が空文字でエラーになるか", () => {
      expect(() => {
        Client.create(
          new ObjectIdGenerator(),
          {
            id: new ObjectID().toHexString(),
            key: "",
            user: new ObjectID().toHexString(),
            type: "master",
          },
          "",
          "http://hoge",
          new Date(0),
        );
      }).toThrow(AtError);
    });

    it("URLスキーマを不正にしたらエラーになるか", () => {
      expect(() => {
        Client.create(
          new ObjectIdGenerator(),
          {
            id: new ObjectID().toHexString(),
            key: "",
            user: new ObjectID().toHexString(),
            type: "master",
          },
          "hoge",
          "hogehttp://hoge.com",
          new Date(0),
        );
      }).toThrow(AtError);
    });

    it("URLのホストなしでエラーになるか", () => {
      expect(() => {
        Client.create(
          new ObjectIdGenerator(),
          {
            id: new ObjectID().toHexString(),
            key: "",
            user: new ObjectID().toHexString(),
            type: "master",
          },
          "http://",
          "",
          new Date(0),
        );
      }).toThrow(AtError);
    });

    it("URLが空でエラーになるか", () => {
      expect(() => {
        Client.create(
          new ObjectIdGenerator(),
          {
            id: new ObjectID().toHexString(),
            key: "",
            user: new ObjectID().toHexString(),
            type: "master",
          },
          "hoge",
          "",
          new Date(0),
        );
      }).toThrow(AtError);
    });
  });

  const clientID = new ObjectID().toHexString();
  const userID = new ObjectID().toHexString();
  const client = new Client(
    clientID,
    "name",
    "http://hoge.com",
    userID,
    new Date(0),
    new Date(100),
  );

  const auth: IAuthTokenMaster = {
    id: "token",
    key: "key",
    user: userID,
    type: "master",
  };

  describe("#changeData", () => {
    it("正常に変更できるか", () => {
      expect(
        client.changeData(auth, "name2", "http://hoge2.com", new Date(200)),
      ).toEqual(
        new Client(
          clientID,
          "name2",
          "http://hoge2.com",
          userID,
          new Date(0),
          new Date(200),
        ),
      );

      expect(
        client.changeData(auth, undefined, "http://hoge2.com", new Date(200)),
      ).toEqual(
        new Client(
          clientID,
          "name",
          "http://hoge2.com",
          userID,
          new Date(0),
          new Date(200),
        ),
      );

      expect(
        client.changeData(auth, "name2", undefined, new Date(200)),
      ).toEqual(
        new Client(
          clientID,
          "name2",
          "http://hoge.com",
          userID,
          new Date(0),
          new Date(200),
        ),
      );
    });

    it("違うユーザーが変更しようとしたらエラーになるか", () => {
      expect(() => {
        const auth: IAuthTokenMaster = {
          id: "token",
          key: "key",
          user: new ObjectID().toHexString(),
          type: "master",
        };

        const client = Client.create(
          new ObjectIdGenerator(),
          auth,
          "hoge",
          "http://hoge",
          new Date(0),
        );

        client.changeData(
          {
            id: new ObjectID().toHexString(),
            key: "",
            user: new ObjectID().toHexString(),
            type: "master",
          },
          "foo",
          "http://foo",
          new Date(100),
        );
      }).toThrow(AtError);
    });

    it("長い名前でエラーになるか", () => {
      expect(() => {
        const auth: IAuthTokenMaster = {
          id: new ObjectID().toHexString(),
          key: "",
          user: new ObjectID().toHexString(),
          type: "master",
        };

        const client = Client.create(
          new ObjectIdGenerator(),
          auth,
          "hoge",
          "http://hoge",
          new Date(0),
        );

        client.changeData(
          auth,
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          undefined,
          new Date(100),
        );
      }).toThrow(AtError);
    });

    it("不正なURLでエラーになるか", () => {
      expect(() => {
        const auth: IAuthTokenMaster = {
          id: new ObjectID().toHexString(),
          key: "",
          user: new ObjectID().toHexString(),
          type: "master",
        };

        const client = Client.create(
          new ObjectIdGenerator(),
          auth,
          "hoge",
          "http://hoge",
          new Date(0),
        );

        client.changeData(auth, undefined, "hogehttp://foo", new Date(100));
      }).toThrow(AtError);
    });
  });

  describe("#toAPI", () => {
    it("認証あり(同一ユーザー)", () => {
      expect(client.toAPI(some(auth))).toEqual({
        id: clientID,
        name: "name",
        url: "http://hoge.com",
        self: true,
        date: new Date(0).toISOString(),
        update: new Date(100).toISOString(),
      });
    });

    it("認証あり(別ユーザー)", () => {
      expect(
        client.toAPI(
          some({
            ...auth,
            user: new ObjectID().toHexString(),
          }),
        ),
      ).toEqual({
        id: clientID,
        name: "name",
        url: "http://hoge.com",
        self: false,
        date: new Date(0).toISOString(),
        update: new Date(100).toISOString(),
      });
    });

    it("認証無し", () => {
      expect(client.toAPI(none)).toEqual({
        id: clientID,
        name: "name",
        url: "http://hoge.com",
        self: null,
        date: new Date(0).toISOString(),
        update: new Date(100).toISOString(),
      });
    });
  });
});
