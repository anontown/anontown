import { Collection, Db } from "mongodb";

export async function createCollection(
  db: Db,
  name: string,
): Promise<Collection<any>> {
  const collectionNames = new Set(
    (await db.listCollections().toArray()).map<string>(col => col.name),
  );

  if (!collectionNames.has(name)) {
    return await db.createCollection(name);
  } else {
    return db.collection(name);
  }
}
