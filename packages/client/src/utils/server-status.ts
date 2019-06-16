import { Env } from "../env";

export async function getServerStatus() {
  const server = await fetch(Env.api.origin + "/ping", {
    mode: "cors",
    cache: "no-store",
  })
    .then(x => x.text())
    .then(x => x === "OK")
    .catch(_e => false);
  const client = await fetch("https://anontown.com/ping", {
    mode: "cors",
    cache: "no-store",
  })
    .then(x => x.text())
    .then(x => x === "OK")
    .catch(_e => false);
  return server || !client;
}
