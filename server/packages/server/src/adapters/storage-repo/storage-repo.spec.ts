import { StorageRepo } from "../../";

import { run } from "./istorage-repo-laws";

describe("StorageRepo", () => {
  run(() => new StorageRepo(), true);
});
