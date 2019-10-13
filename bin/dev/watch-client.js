#!/usr/bin/env node

const { App } = require("./watch_lib");

new App({
  bgs: [
    {
      prefix: "build",
      cmd:
        "cd client && lerna run build:watch --parallel --scope=@anontown/client --include-filtered-dependencies"
    },
    {
      prefix: "server",
      cmd: "cd client && lerna run start --scope @anontown/client"
    }
  ],
  exits: [],
  cmds: {}
}).run();
