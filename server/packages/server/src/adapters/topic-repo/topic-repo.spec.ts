import { run } from "./itopic-repo-laws";

import { ResRepoMock, TopicRepo } from "../../";

describe("TopicRepo", () => {
  run(() => new TopicRepo(new ResRepoMock(), true), true);
});
