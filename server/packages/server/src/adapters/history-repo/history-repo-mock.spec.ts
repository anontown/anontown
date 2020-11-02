import { HistoryRepoMock } from "../../";

import { run } from "./ihistory-repo-laws";

describe("HistoryRepoMock", () => {
  run(() => new HistoryRepoMock(), false);
});
