import { ClientRepoMock } from "../../";

import { run } from "./iclient-repo-laws";

describe("ClientRepoMock", () => {
  run(() => new ClientRepoMock(), false);
});
