import { ProfileRepoMock } from "../../";

import { run } from "./iprofile-repo.th";

describe("ProfileRepoMock", () => {
  run(async callback => {
    await callback(new ProfileRepoMock());
  });
});
