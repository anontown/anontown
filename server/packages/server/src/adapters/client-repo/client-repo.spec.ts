import { ClientRepo } from "../../";

import { run } from "./iclient-repo-laws";

describe("ClientRepo", () => {
  run(() => new ClientRepo(), true);
});
