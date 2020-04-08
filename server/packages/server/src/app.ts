/* tslint:disable:no-var-requires */
require("source-map-support").install();
import { checkMigration } from "./migrate";
import { serverRun } from "./server";

/* tslint:disable:no-floating-promises */
(async () => {
  await checkMigration();
  await serverRun();
})();
