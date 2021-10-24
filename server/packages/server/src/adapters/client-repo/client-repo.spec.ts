import { ClientRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

import { run } from "./iclient-repo.th";

describe("ClientRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new ClientRepo(prisma));
    });
  });
});
