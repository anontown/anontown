import { UserRepoMock } from "../../";
import { run } from "./iuser-repo-laws";
describe("UserRepoMock", () => {
  run(() => new UserRepoMock(), false);
});
