import { TokenRepoMock } from "../../";

import { run } from "./itoken-repo.th";

describe("TokenRepoMock", () => {
  run(async callback => {
    await callback(new TokenRepoMock());
  });
});
