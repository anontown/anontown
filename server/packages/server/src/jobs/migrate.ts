import { runMigrations } from "../migrate";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  await runMigrations();
  process.exit(0);
})();
