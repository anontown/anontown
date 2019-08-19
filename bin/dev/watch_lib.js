#!/usr/bin/env node

const { exec } = require("child_process");

function runExec(cmd) {
  return new Promise((resolve, _reject) => {
    const prc = exec(cmd);
    prc.stdout.on("data", data => {
      process.stdout.write(data.toString());
    });

    prc.stderr.on("data", data => {
      process.stderr.write(data.toString());
    });

    prc.on("close", code => {
      resolve(code);
    });
  });
}

class App {
  constructor({ bgs, exits, cmds }) {
    this.bgs = bgs;
    this.exits = exits;
    this.cmds = cmds;
    this.inputing = false;
    this.pses = [];

    this.bgOuts = [];
  }

  flushBgOuts() {
    this.bgOuts.forEach(({ prefix, type, data }) => {
      process[type].write(`${`[${prefix}]`.padEnd(9, " ")} ${data}`);
    });
    this.bgOuts = [];
  }

  addBgOuts(prefix, type, data) {
    this.bgOuts.push({ prefix, type, data });
    if (!this.inputing) {
      this.flushBgOuts();
    }
  }

  runBg(prefix, cmd) {
    const prc = exec(cmd);
    prc.stdout.on("data", data => {
      this.addBgOuts(prefix, "stdout", data.toString());
    });

    prc.stderr.on("data", data => {
      this.addBgOuts(prefix, "stderr", data.toString());
    });

    this.pses.push(prc);
  }

  run() {
    process.on("SIGINT", async () => {
      console.log("exiting...");
      this.inputing = true;
      for (let cmd of this.exits) {
        await runExec(cmd);
      }
      this.pses.forEach(ps => {
        ps.kill();
      });
      process.exit();
    });

    this.bgs.forEach(({ prefix, cmd }) => this.runBg(prefix, cmd));
    process.stdin.on("data", async data => {
      if (this.inputing) {
        const cmd = this.cmds[data.toString().trim()];
        if (cmd !== undefined) {
          this.flushBgOuts();
          console.log(cmd.msg);
          await runExec(cmd.cmd);
        } else {
          console.log(`unknown command: '${data.toString().trim()}'`);
        }
        this.inputing = false;
      } else {
        this.inputing = true;
        console.log("input command:");
      }
    });
  }
}

module.exports = { App };
