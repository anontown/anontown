/* tslint:disable:no-var-requires */
require("source-map-support").install();
import * as fs from "fs-promise";
import * as path from "path";
import { Config } from "./config";
import { } from "./generator";
import {
  Repo,
} from "./models";
import { serverRun } from "./server";

/* tslint:disable:no-floating-promises */
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

  await serverRun(new Repo());
})();
