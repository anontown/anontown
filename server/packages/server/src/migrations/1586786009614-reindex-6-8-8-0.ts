import { ESClient, Mongo } from "../db";
import { esUtils, mongoUtils } from "../migration-utils";

export async function up() {
  await esUtils.createIndex(ESClient(), {
    index: "reses-6_8_8-0",
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
    index: "histories-6_8_8-0",
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
    index: "msgs-6_8_8-0",
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
    index: "topics-6_8_8-0",
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

  await ESClient().reindex({
    body: {
      source: {
        index: "reses_1",
      },
      dest: {
        index: "reses-6_8_8-0",
      },
    },
  });

  await ESClient().reindex({
    body: {
      source: {
        index: "histories_1",
      },
      dest: {
        index: "histories-6_8_8-0",
      },
    },
  });

  await ESClient().reindex({
    body: {
      source: {
        index: "msgs_1",
      },
      dest: {
        index: "msgs-6_8_8-0",
      },
    },
  });

  await ESClient().reindex({
    body: {
      source: {
        index: "topics_1",
      },
      dest: {
        index: "topics-6_8_8-0",
      },
    },
  });

  await ESClient().indices.updateAliases({
    body: {
      actions: [
        { remove: { index: "reses_1", alias: "reses" } },
        { remove: { index: "histories_1", alias: "histories" } },
        { remove: { index: "msgs_1", alias: "msgs" } },
        { remove: { index: "topics_1", alias: "topics" } },
        { add: { index: "reses-6_8_8-0", alias: "reses" } },
        { add: { index: "histories-6_8_8-0", alias: "histories" } },
        { add: { index: "msgs-6_8_8-0", alias: "msgs" } },
        { add: { index: "topics-6_8_8-0", alias: "topics" } },
      ],
    },
  });
}
