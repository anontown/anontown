import { run } from "./ires-repo.th";

import { ResRepoMock } from "../../";

describe("ResRepoMock", () => {
  run(async callback => {
    await callback(new ResRepoMock());
  });
});
