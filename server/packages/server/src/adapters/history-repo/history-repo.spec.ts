import { HistoryRepo } from "../../";

import { run } from "./ihistory-repo-laws";

describe("HistoryRepo", () => {
  run(() => new HistoryRepo(true), true);
});
