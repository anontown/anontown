// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
require("source-map-support").install();
import { serverRun } from "./server";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  await serverRun();
})();
