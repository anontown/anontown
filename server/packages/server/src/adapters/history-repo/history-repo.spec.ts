import { HistoryRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

import { run } from "./ihistory-repo.th";

describe("HistoryRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new HistoryRepo(prisma));
    });
  });
});
