import { TokenRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

import { run } from "./itoken-repo.th";

describe("TokenRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new TokenRepo(prisma));
    });
  });
});
