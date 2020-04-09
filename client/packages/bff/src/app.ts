import Koa from "koa";
import { env } from "./env";
import send = require("koa-send");
import * as path from "path";
import { RouteData, routeArray } from "@anontown/common/dist/route";
import kr = require("koa-route");
import * as fse from "fs-extra";

const app = new Koa();

const rootDir = "./node_modules/@anontown/client/dist";

function addRoute<P extends string, Q extends object>(route: RouteData<P, Q>) {
  app.use(
    kr.get(route.matcher(), async (ctx, ..._pathData) => {
      // const parsedData = route.parsePathData(pathData);
      const template = await fse.readFile(
        path.join(rootDir, ".index.template.html"),
        "utf8"
      );
      const initScript = `window.__ENV__=${JSON.stringify(env.jsEnv)};`;
      ctx.body = template.replace(
        "anontown_dummy_replaced_by_bff()",
        initScript.replace(/</g, "\\u003c")
      );
    })
  );
}

for (const r of routeArray) {
  addRoute(r);
}

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
