import Koa from "koa";
import { env } from "./env";
import send = require("koa-send");
import * as path from "path";
import { RouteData, routeArray } from "@anontown/common/dist/route";
import kr = require("koa-route");
import * as fse from "fs-extra";
import * as lodash from "lodash";
import { outputJsValueToHtml } from "@anontown/common/dist/output-js-value-to-html";

const app = new Koa();

const rootDir = "./node_modules/@anontown/client/dist";

function addRoute<P extends string, Q extends object>(route: RouteData<P, Q>) {
  app.use(
    kr.get(route.matcher(), async (ctx, ..._pathData) => {
      // const parsedData = route.parsePathData(pathData);
      const template = await fse.readFile(
        path.join(rootDir, "index.ejs"),
        "utf8"
      );
      ctx.body = lodash.template(template)({
        escapedEnvJson: outputJsValueToHtml(env.jsEnv),
      });
    })
  );
}

for (const r of routeArray) {
  addRoute(r);
}

app.use(
  kr.get("/ping", async (ctx) => {
    ctx.body = "OK";
  })
);

app.use(async (ctx, next) => {
  let done = false;

  if (ctx.method === "HEAD" || ctx.method === "GET") {
    try {
      const isImmutable = ctx.path.endsWith(".immutable.js");

      await send(ctx, ctx.path, {
        root: path.resolve(rootDir),
        immutable: isImmutable,
        maxage: isImmutable ? 1000 * 60 * 60 * 24 * 30 : 0,
      });
      done = true;
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }
    }
  }

  if (!done) {
    await next();
  }
});

app.listen(env.port);
