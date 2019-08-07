const fs = require("pn/fs");
const svg2png = require("svg2png");
const pngToIco = require("png-to-ico");

(async () => {
  try {
    await fs.mkdir("dist");
  } catch {}

  try {
    await fs.mkdir("dist/icons");
  } catch {}

  const data = await fs.readFile(require.resolve("@anontown/icon/icon.svg"));
  for (const size of [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]) {
    await fs.writeFile(
      `dist/icons/${size}.png`,
      await svg2png(data, { width: size, height: size })
    );
  }

  await fs.writeFile("dist/favicon.ico", await pngToIco("dist/icons/32.png"));
})();
