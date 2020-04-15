import { ESClient } from "../db";
import { esAutoReindex } from "../migration-utils";

export async function up() {
  await esAutoReindex.createIndex(
    { name: "reses", ver: 1 },
    {
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
  );

  await esAutoReindex.createIndex(
    { name: "histories", ver: 1 },
    {
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
  );

  await esAutoReindex.createIndex(
    {
      name: "msgs",
      ver: 1,
    },
    {
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
  );

  await esAutoReindex.createIndex(
    { name: "topics", ver: 1 },
    {
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
  );

  await ESClient().reindex({
    body: {
      source: {
        index: "reses_1",
      },
      dest: {
        index: "reses-1",
      },
    },
  });

  await ESClient().reindex({
    body: {
      source: {
        index: "histories_1",
      },
      dest: {
        index: "histories-1",
      },
    },
  });

  await ESClient().reindex({
    body: {
      source: {
        index: "msgs_1",
      },
      dest: {
        index: "msgs-1",
      },
    },
  });

  await ESClient().reindex({
    body: {
      source: {
        index: "topics_1",
      },
      dest: {
        index: "topics-1",
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
        { add: { index: "reses-1", alias: "reses" } },
        { add: { index: "histories-1", alias: "histories" } },
        { add: { index: "msgs-1", alias: "msgs" } },
        { add: { index: "topics-1", alias: "topics" } },
      ],
    },
  });
}
