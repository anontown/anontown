const { exec } = require("child_process");

const up = exec("python3 docker-compose.py dev | docker-compose -f - up");
let outlist = [];
let cmd = "";
function output() {
  if (cmd.length !== 0) {
    return;
  }

  outlist.forEach(f => f());

  outlist = [];
}

up.stdout.on("data", data => {
  outlist.push(() => process.stdout.write(data.toString()));
  output();
});

up.stderr.on("data", data => {
  outlist.push(() => process.stderr.write(data.toString()));
  output();
});

process.stdin.setRawMode(true);
process.stdin.setEncoding("utf8");
process.stdin.on("data", key => {
  if (key === "\u0003") {
    process.exit();
  } else if (key === "\r") {
    if (cmd === ":r") {
      cmd += "\n";
      const restart = exec(
        "python3 docker-compose.py dev | docker-compose -f - restart app"
      );
      restart.stdout.on("data", data => {
        process.stdout.write(data.toString());
      });

      restart.stderr.on("data", data => {
        process.stderr.write(data.toString());
      });

      restart.on("close", () => {
        cmd = "";
      });
    }
    cmd = "";
  } else {
    cmd += key;
  }
});
