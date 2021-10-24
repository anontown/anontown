import { MsgRepoMock } from "../../";

import { run } from "./imsg-repo.th";

describe("MsgRepoMock", () => {
  run(async callback => {
    await callback(new MsgRepoMock());
  });
});
