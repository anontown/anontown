import * as fs from "fs-promise";
import * as path from "path";
import { Config } from "./config";
import { migrate } from "./migrate";

// tslint:disable-next-line:no-floating-promises
(async () => {
  // フォルダ作成
  try {
    await fs.mkdir(path.join(Config.saveDir, "logs"));
  } catch {
    /* tslint:disable:no-empty */
  }

  try {
    await fs.mkdir(path.join(Config.saveDir, "data"));
  } catch {
    /* tslint:disable:no-empty */
  }

  const migrateFile = path.join(Config.saveDir, "./data/.migrate.json");

  const ver = await fs
    .readFile(migrateFile, "utf8")
    .then(json => JSON.parse(json) as number)
    .catch(() => 0);
  console.log("current db-version", ver);
  const newVer = await migrate(ver);
  console.log("updated db-version", newVer);
  await fs.writeFile(migrateFile, JSON.stringify(newVer), {
    encoding: "utf8",
  });
  process.exit(0);
})();
