import { UserRepoMock } from "../../";
import { run } from "./iuser-repo.th";
describe("UserRepoMock", () => {
  run(async callback => {
    await callback(new UserRepoMock());
  });
});
