import { run } from "./ires-repo-laws";

import { ResRepoMock } from "../../";

describe("ResRepoMock", () => {
  run(() => new ResRepoMock(), false);
});
