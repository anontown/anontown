#!/usr/bin/env node

const { exec } = require("child_process");

class App {
  constructor() {
    this.upProcessOut = [];
    this.upProcess = null;
    this.input = "";
  }

  output() {
    this.upProcessOut.forEach(({ type, data }) => {
      switch (type) {
        case "stdout":
          process.stdout.write(data);
          break;
        case "stderr":
          process.stderr.write(data);
          break;
      }
    });
    this.upProcessOut = [];
  }

  addUpProcessOut(type, data) {
    this.upProcessOut.push({ type, data });
    if (this.input !== null && this.input.length === 0) {
      this.output();
    }
  }

  runUpProcess() {
    this.upProcess = exec(
      "python3 docker-compose.py dev | docker-compose -f - up"
    );
    this.upProcess.stdout.on("data", data => {
      this.addUpProcessOut("stdout", data.toString());
    });

    this.upProcess.stderr.on("data", data => {
      this.addUpProcessOut("stderr", data.toString());
    });
  }

  run() {
    this.runUpProcess();
    process.stdin.setRawMode(true);
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", key => {
      if (this.input === null) {
        return;
      }

      if (key === "\u0003") {
        console.log("exiting...");
        this.input = null;
        const stopProcess = exec(
          "python3 docker-compose.py dev | docker-compose -f - stop"
        );
        stopProcess.stdout.on("data", data => {
          process.stdout.write(data.toString());
        });

        stopProcess.stderr.on("data", data => {
          process.stderr.write(data.toString());
        });

        restartProcess.on("close", () => {
          process.exit();
        });
      } else if (key === "\r") {
        console.log();
        if (this.input === ":r") {
          this.output();
          console.log("restart...");
          this.input = null;
          const restartProcess = exec(
            "python3 docker-compose.py dev | docker-compose -f - restart app"
          );
          restartProcess.stdout.on("data", data => {
            process.stdout.write(data.toString());
          });

          restartProcess.stderr.on("data", data => {
            process.stderr.write(data.toString());
          });

          restartProcess.on("close", () => {
            this.input = "";
          });
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
