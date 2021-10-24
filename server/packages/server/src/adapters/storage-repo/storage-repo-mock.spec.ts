import { StorageRepoMock } from "../../";

import { run } from "./istorage-repo.th";

describe("StorageRepoMock", () => {
  run(async callback => {
    await callback(new StorageRepoMock());
  });
});
