import { migrations } from "./migrations";

export async function migrate(curVersion: number): Promise<number> {
  for (let i = curVersion; i < migrations.length; i++) {
    await migrations[i]();
  }
  return migrations.length;
}
