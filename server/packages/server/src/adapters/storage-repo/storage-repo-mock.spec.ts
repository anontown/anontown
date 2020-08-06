import { StorageRepoMock } from "../../";

import { run } from "./istorage-repo-laws";

describe("StorageRepoMock", () => {
  run(() => new StorageRepoMock(), false);
});
