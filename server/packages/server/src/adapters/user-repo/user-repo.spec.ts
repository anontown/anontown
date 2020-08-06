import { UserRepo } from "../../";
import { run } from "./iuser-repo-laws";
describe("UserRepo", () => {
  run(() => new UserRepo(), true);
});
