import { StorageRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

import { run } from "./istorage-repo.th";

describe("StorageRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new StorageRepo(prisma));
    });
  });
});
