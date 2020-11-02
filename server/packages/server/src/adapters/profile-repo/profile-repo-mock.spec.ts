import { ProfileRepoMock } from "../../";

import { run } from "./iprofile-repo-laws";

describe("ProfileRepoMock", () => {
  run(() => new ProfileRepoMock(), false);
});
