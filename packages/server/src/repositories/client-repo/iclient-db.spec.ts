import { ObjectID } from "mongodb";
import { Client, ObjectIDGenerator } from "../../";
import { fromClient, toClient } from "./iclient-db";

describe("IClientDB", () => {
  describe("toClient", () => {
    it("正常にインスタンス化出来るか", () => {
      const clientID = ObjectIDGenerator();
      const userID = ObjectIDGenerator();
      expect(
        toClient({
          _id: new ObjectID(clientID),
          name: "name",
          url: "https://hoge.com",
          user: new ObjectID(userID),
          date: new Date(0),
          update: new Date(100),
        }),
      ).toEqual(
        new Client(
          clientID,
          "name",
          "https://hoge.com",
          userID,
          new Date(0),
          new Date(100),
        ),
      );
    });
  });

  describe("fromClient", () => {
    it("正常に出力できるか", () => {
      const clientID = ObjectIDGenerator();
      const userID = ObjectIDGenerator();
      const client = new Client(
        clientID,
        "name",
        "http://hoge.com",
        userID,
        new Date(0),
        new Date(100),
      );

      expect(fromClient(client)).toEqual({
        _id: new ObjectID(clientID),
        name: "name",
        url: "http://hoge.com",
        user: new ObjectID(userID),
        date: new Date(0),
        update: new Date(100),
      });
    });
  });
});
