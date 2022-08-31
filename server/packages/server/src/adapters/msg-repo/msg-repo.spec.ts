import { MsgRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

import { run } from "./imsg-repo.th";

describe("MsgRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new MsgRepo(prisma));
    });
  });
});
