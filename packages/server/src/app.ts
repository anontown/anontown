/* tslint:disable:no-var-requires */
require("source-map-support").install();
import * as fs from "fs-promise";
import * as path from "path";
import { Config } from "./config";
import {} from "./generator";
import { Repo } from "./models";
import { serverRun } from "./server";

/* tslint:disable:no-floating-promises */
(async () => {
  await serverRun(new Repo());
})();
