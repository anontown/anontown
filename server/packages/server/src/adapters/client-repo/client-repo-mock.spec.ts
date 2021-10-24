import { ClientRepoMock } from "../../";

import { run } from "./iclient-repo.th";

describe("ClientRepoMock", () => {
  run(async callback => callback(new ClientRepoMock()));
});
