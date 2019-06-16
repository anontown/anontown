import { migrate } from "./migrate";
import * as fs from "fs-promise";
import * as path from "path";
import { Config } from "./config";

(async () => {
  const migrateFile = path.join(Config.saveDir, "./data/.migrate.json");

  const ver = await fs.readFile(migrateFile, "utf8").then(json => JSON.parse(json) as number).catch(() => 0);
  const newVer = await migrate(ver);
  await fs.writeFile(migrateFile, JSON.stringify(newVer), {
    encoding: "utf8",
  });
})();