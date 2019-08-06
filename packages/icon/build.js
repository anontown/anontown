const fs = require("pn/fs");
const svg2png = require("svg2png");

(async () => {
  try {
    await fs.mkdir("dist");
  } catch {}

  const data = await fs.readFile("icon.svg");
  for (const size of [4, 5, 6, 7, 8, 9, 10].map(x => 2 ** x)) {
    await fs.writeFile(
      `dist/${size}.png`,
      await svg2png(data, { width: size, height: size })
    );
  }
})();
