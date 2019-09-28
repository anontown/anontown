#!/usr/bin/env node

const { App } = require("./watch_lib");

new App({
  bgs: [
    {
      prefix: "docker",
      cmd: "DC_ENV=dev python3 docker-compose.py | docker-compose -f - up"
    },
    {
      prefix: "build",
      cmd:
        "lerna run build:watch --parallel --scope=@anontown/server --include-filtered-dependencies"
    }
  ],
  exits: ["DC_ENV=dev python3 docker-compose.py | docker-compose -f - stop"],
  cmds: {
    ":r": {
      cmd:
        "DC_ENV=dev python3 docker-compose.py | docker-compose -f - restart app",
      msg: "restart..."
    }
  }
}).run();
