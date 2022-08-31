import { UserRepo } from "../../";
import { $transactionAfterRollback } from "../../prisma-client";
import { run } from "./iuser-repo.th";
describe("UserRepo", () => {
  run(async callback => {
    await $transactionAfterRollback(async prisma => {
      await callback(new UserRepo(prisma));
    });
  });
});
