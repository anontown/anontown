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

    this.bgOuts = [];
    this.input = "";
  }

  flushBgOuts() {
    this.bgOuts.forEach(({ prefix, type, data }) => {
      process[type].write(`${`[${prefix}]`.padEnd(9, " ")} ${data}`);
    });
    this.bgOuts = [];
  }

  addBgOuts(prefix, type, data) {
    this.bgOuts.push({ prefix, type, data });
    if (this.input !== null && this.input.length === 0) {
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

    process.on("exit", () => {
      prc.kill();
    });
  }

  run() {
    this.bgs.forEach(({ prefix, cmd }) => this.runBg(prefix, cmd));
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", async key => {
      if (this.input === null) {
        return;
      }

      if (key === "\u0003") {
        console.log("exiting...");
        this.input = null;
        for (let cmd of this.exits) {
          await runExec(cmd);
        }
        process.exit();
      } else if (key === "\r") {
        console.log();
        const cmd = this.cmds[this.input];
        if (cmd !== undefined) {
          this.flushBgOuts();
          console.log(cmd.msg);
          this.input = null;
          await runExec(cmd.cmd);
          this.input = "";
        } else {
          console.log(`unknown command: '${this.input}'`);
          this.input = "";
        }
      } else {
        if (this.input !== null) {
          if (/^[a-zA-Z0-9_\:\-]*$/.test(key)) {
            this.input += key;
            process.stdout.write(key);
          }
        }
      }
    });
  }
}

module.exports = { App };
