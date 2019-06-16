import { migrate } from "../migrate";
import { dbDrop } from "../db-drop";

export async function dbReset() {
  if (process.env.AT_MODE === "TEST") {
    await dbDrop();
    await migrate(0);
  } else {
    throw new Error("dbReset:not test");
  }
}
