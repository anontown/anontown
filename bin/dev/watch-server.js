#!/usr/bin/env node

const { App } = require("./watch_lib");

new App({
  bgs: [
    {
      prefix: "docker",
      cmd: "python3 docker-compose.py dev | docker-compose -f - up"
    },
    {
      prefix: "build",
      cmd:
        "lerna run build:watch --parallel --scope=@anontown/server --include-filtered-dependencies"
    }
  ],
  exits: ["python3 docker-compose.py dev | docker-compose -f - stop"],
  cmds: {
    ":r": {
      cmd: "python3 docker-compose.py dev | docker-compose -f - restart app",
      msg: "restart..."
    }
  }
}).run();
