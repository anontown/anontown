import { run } from "./itopic-repo.th";

import { ResRepoMock, TopicRepoMock } from "../../";

describe("TopicRepoMock", () => {
  run(async callback => {
    await callback(new TopicRepoMock(new ResRepoMock()));
  });
});
