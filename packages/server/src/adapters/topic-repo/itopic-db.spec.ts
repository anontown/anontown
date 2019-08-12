import * as Im from "immutable";
import {
  ITopicBaseAPI,
  ITopicSearchBaseAPI,
  Res,
  TopicBase,
  TopicFork,
  TopicNormal,
  TopicOne,
  TopicSearchBase,
  User,
} from "../../entities";
import { applyMixins, Copyable } from "../../utils/";
import {
  fromTopicBase,
  fromTopicFork,
  fromTopicSearchBase,
  toTopic,
  toTopicFork,
  toTopicNormal,
} from "./itopic-db";

describe("ITopicDB", () => {
  class TopicSearchBaseTest extends Copyable<TopicSearchBaseTest>
    implements TopicSearchBase<"normal", TopicSearchBaseTest> {
    readonly type: "normal" = "normal";

    toBaseAPI!: () => ITopicBaseAPI<"normal">;
    hash!: (date: Date, user: User) => string;
    toAPI!: () => ITopicSearchBaseAPI<"normal">;
    resUpdate!: (res: Res) => TopicSearchBaseTest;

    constructor(
      readonly id: string,
      readonly title: string,
      readonly tags: Im.List<string>,
      readonly text: string,
      readonly update: Date,
      readonly date: Date,
      readonly resCount: number,
      readonly ageUpdate: Date,
      readonly active: boolean,
    ) {
      super(TopicSearchBaseTest);
    }
  }
  applyMixins(TopicSearchBaseTest, [TopicSearchBase]);

  const topicSearchBaseTest = new TopicSearchBaseTest(
    "topic",
    "title",
    Im.List(),
    "text",
    new Date(100),
    new Date(0),
    10,
    new Date(50),
    true,
  );

  class TopicBaseTest extends Copyable<TopicBaseTest>
    implements TopicBase<"normal", TopicBaseTest> {
    readonly type: "normal" = "normal";
    toBaseAPI!: () => ITopicBaseAPI<"normal">;
    hash!: (date: Date, user: User) => string;
    resUpdate!: (res: Res) => TopicBaseTest;

    constructor(
      readonly id: string,
      readonly title: string,
      readonly update: Date,
      readonly date: Date,
      readonly resCount: number,
      readonly ageUpdate: Date,
      readonly active: boolean,
    ) {
      super(TopicBaseTest);
    }
  }
  applyMixins(TopicBaseTest, [TopicBase]);

  const topicBaseTest = new TopicBaseTest(
    "topic",
    "title",
    new Date(100),
    new Date(0),
    10,
    new Date(50),
    true,
  );

  describe("fromTopicSearchBase", () => {
    it("正常に変換出来るか", () => {
      expect(fromTopicSearchBase(topicSearchBaseTest)).toEqual(
        fromTopicBase<"normal">()(topicSearchBaseTest, {
          tags: [],
          text: "text",
        }),
      );
    });
  });

  describe("fromTopicBase", () => {
    it("正常に変換出来るか", () => {
      expect(fromTopicBase<"normal">()(topicBaseTest, {})).toEqual({
        id: "topic",
        body: {
          type: "normal",
          title: "title",
          update: new Date(100).toISOString(),
          date: new Date(0).toISOString(),
          ageUpdate: new Date(50).toISOString(),
          active: true,
        },
      });
    });
  });

  const topicOne = new TopicOne(
    "topic",
    "title",
    Im.List(),
    "text",
    new Date(100),
    new Date(0),
    5,
    new Date(50),
    true,
  );

  describe("toTopic", () => {
    it("正常に生成できるか", () => {
      expect(
        toTopic(
          {
            id: "topic",
            body: {
              type: "one",
              title: "title",
              update: new Date(100).toISOString(),
              date: new Date(0).toISOString(),
              ageUpdate: new Date(50).toISOString(),
              active: true,
              tags: [],
              text: "text",
            },
          },
          5,
        ),
      ).toEqual(topicOne);
    });
  });

  const topicNormal = new TopicNormal(
    "topic",
    "title",
    Im.List(),
    "text",
    new Date(100),
    new Date(0),
    5,
    new Date(50),
    true,
  );

  describe("toTopicNormal", () => {
    it("正常に生成出来るか", () => {
      expect(
        toTopicNormal(
          {
            id: "topic",
            body: {
              type: "normal",
              title: "title",
              update: new Date(100).toISOString(),
              date: new Date(0).toISOString(),
              ageUpdate: new Date(50).toISOString(),
              active: true,
              tags: [],
              text: "text",
            },
          },
          5,
        ),
      ).toEqual(topicNormal);
    });
  });

  const topicFork = new TopicFork(
    "topic",
    "title",
    new Date(100),
    new Date(0),
    5,
    new Date(50),
    true,
    "parent",
  );

  describe("toTopicFork", () => {
    it("正常に生成できるか", () => {
      expect(
        toTopicFork(
          {
            id: "topic",
            body: {
              type: "fork",
              title: "title",
              update: new Date(100).toISOString(),
              date: new Date(0).toISOString(),
              ageUpdate: new Date(50).toISOString(),
              active: true,
              parent: "parent",
            },
          },
          5,
        ),
      ).toEqual(topicFork);
    });
  });

  describe("fromTopicFork", () => {
    it("正常に生成出来るか", () => {
      expect(fromTopicFork(topicFork)).toEqual(
        fromTopicBase<"fork">()(topicFork, {
          parent: "parent",
        }),
      );
    });
  });
});
