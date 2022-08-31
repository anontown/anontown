import { run } from "./itopic-repo.th";

import { TopicRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";

describe("TopicRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new TopicRepo(prisma));
    });
  });
});
