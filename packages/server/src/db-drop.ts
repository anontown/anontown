import { DB, ESClient } from "./db";

export async function dbDrop() {
  const db = await DB();
  const cls = await db.collections();
  for (const cl of cls) {
    if (cl.collectionName.indexOf("system.") !== 0) {
      await cl.drop();
    }
  }

  await ESClient().indices.delete({ index: "*" });
}
