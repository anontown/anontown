import { dbDrop } from "../db-drop";
import { forceRunAllMigrationsAndNotSave } from "../migrate";

export async function dbReset() {
  await dbDrop();
  await forceRunAllMigrationsAndNotSave();
}
