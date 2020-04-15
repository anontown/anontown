import { runMigrations } from "../migrate";

// tslint:disable-next-line:no-floating-promises
(async () => {
  await runMigrations();
  process.exit(0);
})();
