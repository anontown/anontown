import { migrate } from "../migrate";
import { dbDrop } from "../db-drop";

export async function dbReset() {
  await dbDrop();
  await migrate(0);
}
