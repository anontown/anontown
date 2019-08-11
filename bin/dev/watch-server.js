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
  constructor() {
    this.upProcessOut = [];
    this.input = "";
  }

  output() {
    this.upProcessOut.forEach(({ prefix, type, data }) => {
      process[type].write(`${`[${prefix}]`.padEnd(9, " ")} ${data}`);
    });
    this.upProcessOut = [];
  }

  addUpProcessOut(prefix, type, data) {
    this.upProcessOut.push({ prefix, type, data });
    if (this.input !== null && this.input.length === 0) {
      this.output();
    }
  }

  runUpProcess() {
    const prc = exec("python3 docker-compose.py dev | docker-compose -f - up");
    prc.stdout.on("data", data => {
      this.addUpProcessOut("docker", "stdout", data.toString());
    });

    prc.stderr.on("data", data => {
      this.addUpProcessOut("docker", "stderr", data.toString());
    });
  }

  runBuildProcess() {
    const prc = exec(
      "lerna run build:watch --parallel --scope=@anontown/server --include-filtered-dependencies"
    );
    prc.stdout.on("data", data => {
      this.addUpProcessOut("build", "stdout", data.toString());
    });

    prc.stderr.on("data", data => {
      this.addUpProcessOut("build", "stderr", data.toString());
    });
  }

  run() {
    this.runUpProcess();
    this.runBuildProcess();
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", async key => {
      if (this.input === null) {
        return;
      }

      if (key === "\u0003") {
        console.log("exiting...");
        this.input = null;
        await runExec(
          "python3 docker-compose.py dev | docker-compose -f - stop"
        );
        process.exit();
      } else if (key === "\r") {
        console.log();
        if (this.input === ":r") {
          this.output();
          console.log("restart...");
          this.input = null;
          await runExec(
            "python3 docker-compose.py dev | docker-compose -f - restart app"
          );
          this.input = "";
        } else {
          console.log(`unknown command: '${this.input}'`);
          this.input = "";
        }
      } else {
        if (this.input !== null) {
          if (/^[a-zA-Z0-9\:]*$/.test(key)) {
            this.input += key;
            process.stdout.write(key);
          }
        }
      }
    });
  }
}

new App().run();
