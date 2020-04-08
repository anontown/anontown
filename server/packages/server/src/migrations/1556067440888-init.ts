import { ESClient, Mongo } from "../db";
import { esUtils, mongoUtils } from "../migration-utils";

export async function up() {
  const db = await Mongo();

  const clients = await mongoUtils.createCollection(db, "clients");
  await clients.createIndex({ user: 1 }, { name: "user_1" });
  await clients.createIndex({ date: 1 }, { name: "date_1" });
  await clients.createIndex({ update: 1 }, { name: "update_1" });

  const profiles = await mongoUtils.createCollection(db, "profiles");
  await profiles.createIndex({ user: 1 }, { name: "user_1" });
  await profiles.createIndex({ date: 1 }, { name: "date_1" });
  await profiles.createIndex({ update: 1 }, { name: "update_1" });
  await profiles.createIndex({ sn: 1 }, { name: "sn_1", unique: true });

  const tokens = await mongoUtils.createCollection(db, "tokens");
  await tokens.createIndex({ type: 1 }, { name: "type_1" });
  await tokens.createIndex({ user: 1 }, { name: "user_1" });
  await tokens.createIndex({ date: 1 }, { name: "date_1" });
  await tokens.createIndex({ client: 1 }, { name: "client_1" });

  const users = await mongoUtils.createCollection(db, "users");
  await users.createIndex({ sn: 1 }, { name: "sn_1", unique: true });
  await users.createIndex({ "resWait.m10": 1 }, { name: "resWait.m10_1" });
  await users.createIndex({ "resWait.m30": 1 }, { name: "resWait.m30_1" });
  await users.createIndex({ "resWait.h1": 1 }, { name: "resWait.h1_1" });
  await users.createIndex({ "resWait.h6": 1 }, { name: "resWait.h6_1" });
  await users.createIndex({ "resWait.h12": 1 }, { name: "resWait.h12_1" });
  await users.createIndex({ "resWait.d1": 1 }, { name: "resWait.d1_1" });
  await users.createIndex({ point: 1 }, { name: "point_1" });
  await users.createIndex({ date: 1 }, { name: "date_1" });

  const storages = await mongoUtils.createCollection(db, "storages");
  await storages.createIndex(
    { client: 1, user: 1, key: 1 },
    { name: "client_1_user_1_key_1", unique: true },
  );

  await ESClient().indices.putTemplate({
    name: "template",
    body: {
      index_patterns: ["*"],
      settings: {
        analysis: {
          analyzer: {
            default: {
              type: "custom",
              tokenizer: "kuromoji_tokenizer",
              char_filter: ["icu_normalizer", "kuromoji_iteration_mark"],
              filter: [
                "kuromoji_baseform",
                "kuromoji_part_of_speech",
                "ja_stop",
                "kuromoji_number",
                "kuromoji_stemmer",
              ],
            },
          },
        },
      },
    },
  });

  await esUtils.createIndex(ESClient(), {
    index: "reses_1",
    body: {
      mappings: {
        doc: {
          dynamic: "strict",
          properties: {
            // Base
            type: {
              type: "keyword",
            },
            topic: {
              type: "keyword",
            },
            date: {
              type: "date",
            },
            user: {
              type: "keyword",
            },
            votes: {
              type: "nested",
              properties: {
                user: {
                  type: "keyword",
                },
                value: {
                  type: "integer",
                },
                lv: {
                  type: "integer",
                },
              },
            },
            lv: {
              type: "integer",
            },
            hash: {
              type: "keyword",
            },
            // Normal
            name: {
              type: "text",
            },
            text: {
              type: "text",
            },
            reply: {
              type: "nested",
              properties: {
                res: {
                  type: "keyword",
                },
                user: {
                  type: "keyword",
                },
              },
            },
            deleteFlag: {
              type: "keyword",
            },
            profile: {
              type: "keyword",
            },
            age: {
              type: "boolean",
            },
            // History
            history: {
              type: "keyword",
            },
            // Topic
            // Fork
            fork: {
              type: "keyword",
            },
          },
        },
      },
    },
  });

  await esUtils.createIndex(ESClient(), {
    index: "histories_1",
    body: {
      mappings: {
        doc: {
          dynamic: "strict",
          properties: {
            topic: {
              type: "keyword",
            },
            title: {
              type: "text",
            },
            tags: {
              type: "keyword",
            },
            text: {
              type: "text",
            },
            date: {
              type: "date",
            },
            hash: {
              type: "keyword",
            },
            user: {
              type: "keyword",
            },
          },
        },
      },
    },
  });

  await esUtils.createIndex(ESClient(), {
    index: "msgs_1",
    body: {
      mappings: {
        doc: {
          dynamic: "strict",
          properties: {
            receiver: {
              type: "keyword",
            },
            text: {
              type: "text",
            },
            date: {
              type: "date",
            },
          },
        },
      },
    },
  });

  await esUtils.createIndex(ESClient(), {
    index: "topics_1",
    body: {
      mappings: {
        doc: {
          dynamic: "strict",
          properties: {
            // Base
            type: {
              type: "keyword",
            },
            title: {
              type: "text",
            },
            update: {
              type: "date",
            },
            date: {
              type: "date",
            },
            ageUpdate: {
              type: "date",
            },
            active: {
              type: "boolean",
            },

            // Search
            tags: {
              type: "keyword",
            },
            text: {
              type: "text",
            },

            // Normal
            // One
            // Fork
            parent: {
              type: "keyword",
            },
          },
        },
      },
    },
  });

  await ESClient().indices.putAlias({
    name: "reses",
    index: "reses_1",
  });

  await ESClient().indices.putAlias({
    name: "histories",
    index: "histories_1",
  });

  await ESClient().indices.putAlias({
    name: "msgs",
    index: "msgs_1",
  });

  await ESClient().indices.putAlias({
    name: "topics",
    index: "topics_1",
  });
}
