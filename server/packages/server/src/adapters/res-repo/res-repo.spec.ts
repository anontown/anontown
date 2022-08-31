import { run } from "./ires-repo.th";

import { ResRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

describe("ResRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new ResRepo(prisma));
    });
  });
});
