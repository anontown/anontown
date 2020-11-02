import { TokenRepo } from "../../";

import { run } from "./itoken-repo-laws";

describe("TokenRepo", () => {
  run(() => new TokenRepo(), true);
});
