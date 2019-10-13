#!/usr/bin/env node

const { App } = require("./watch_lib");

process.chdir("/client");

new App({
  bgs: [
    {
      prefix: "build",
      cmd:
        "lerna run build:watch --parallel --scope=@anontown/client --include-filtered-dependencies"
    },
    {
      prefix: "server",
      cmd: "lerna run start --scope @anontown/client"
    }
  ],
  exits: [],
  cmds: {}
}).run();
