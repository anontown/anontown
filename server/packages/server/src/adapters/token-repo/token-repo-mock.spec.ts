import { TokenRepoMock } from "../../";

import { run } from "./itoken-repo-laws";

describe("TokenRepoMock", () => {
  run(() => new TokenRepoMock(), false);
});
