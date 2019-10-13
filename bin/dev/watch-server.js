#!/usr/bin/env node

const { App } = require("./watch_lib");

new App({
  bgs: [
    {
      prefix: "docker",
      cmd: "DCDY_MODE=dev dcdy up"
    },
    {
      prefix: "build",
      cmd:
        "lerna run build:watch --parallel --scope=@anontown/server --include-filtered-dependencies"
    }
  ],
  exits: ["DCDY_MODE=dev dcdy stop"],
  cmds: {
    ":r": {
      cmd: "DCDY_MODE=dev dcdy restart app",
      msg: "restart..."
    }
  }
}).run();
