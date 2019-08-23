import { UserRepo } from "../../";
import { DummyLogger } from "../logger/index";
import { run } from "./iuser-repo.th";
describe("UserRepo", () => {
  run(() => new UserRepo(new DummyLogger()), true);
});
