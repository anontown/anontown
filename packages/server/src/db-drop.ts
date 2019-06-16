import { DB, ESClient } from "./db";

export async function dbDrop() {
  const db = await DB();

  await db.collection("clients").drop();
  await db.collection("profiles").drop();
  await db.collection("tokens").drop();
  await db.collection("users").drop();
  await db.collection("storages").drop();

  const es = ESClient();

  await es.indices.deleteAlias({ name: "reses", index: "reses_1" });
  await es.indices.deleteAlias({ name: "histories", index: "histories_1" });
  await es.indices.deleteAlias({ name: "msgs", index: "msgs_1" });
  await es.indices.deleteAlias({ name: "topics", index: "topics_1" });
  await es.indices.delete({ index: ["reses_1", "histories_1", "msgs_1", "topics_1"] });
  await es.deleteTemplate({ id: "template" });
}