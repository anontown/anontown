import { esUtils } from "../migration-utils";

export async function up() {
  await esUtils.reindex("reses", "reses_1", {
    index: "reses_1586956049557",
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
  await esUtils.reindex("histories", "histories_1", {
    index: "histories_1586956049557",
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

  await esUtils.reindex("msgs", "msgs_1", {
    index: "msgs_1586956049557",
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
  await esUtils.reindex("topics", "topics_1", {
    index: "topics_1586956049557",
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
}
