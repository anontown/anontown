import { runMigrations } from "../migrate";
import { autoReindex } from "../migration-utils/es-auto-reindex";

// tslint:disable-next-line:no-floating-promises
(async () => {
  await runMigrations();
  await autoReindex();
  process.exit(0);
})();
