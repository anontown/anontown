import { dbDrop } from "../db-drop";
import { migrate } from "../migrate";

export async function dbReset() {
  await dbDrop();
  await migrate(0);
}
