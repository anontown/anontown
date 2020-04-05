/* tslint:disable:no-var-requires */
require("source-map-support").install();
import { serverRun } from "./server";
import { checkMigration } from "./migrate";

/* tslint:disable:no-floating-promises */
(async () => {
  await checkMigration();
  await serverRun();
})();
