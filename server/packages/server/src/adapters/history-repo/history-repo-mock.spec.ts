import { HistoryRepoMock } from "../../";

import { run } from "./ihistory-repo.th";

describe("HistoryRepoMock", () => {
  run(async callback => {
    await callback(new HistoryRepoMock());
  });
});
