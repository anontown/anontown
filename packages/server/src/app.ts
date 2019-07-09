/* tslint:disable:no-var-requires */
require("source-map-support").install();
import { Repo } from "./repositories";
import { serverRun } from "./server";

/* tslint:disable:no-floating-promises */
(async () => {
  await serverRun(new Repo());
})();
