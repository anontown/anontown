import { ProfileRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

import { run } from "./iprofile-repo.th";

describe("ProfileRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new ProfileRepo(prisma));
    });
  });
});
