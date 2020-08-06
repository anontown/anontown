import { ProfileRepo } from "../../";

import { run } from "./iprofile-repo-laws";

describe("ProfileRepo", () => {
  run(() => new ProfileRepo(), true);
});
