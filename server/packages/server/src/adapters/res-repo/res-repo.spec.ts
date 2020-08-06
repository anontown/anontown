import { run } from "./ires-repo-laws";

import { ResRepo } from "../../";

describe("ResRepo", () => {
  run(() => new ResRepo(true), true);
});
