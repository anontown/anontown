import { rxOps } from "../prelude";
import * as rxAjax from "rxjs/ajax";

import { Env } from "../env";

export function upload(data: FormData): Promise<string> {
  return rxAjax
    .ajax({
      url: "https://api.imgur.com/3/image",
      method: "POST",
      headers: {
        Authorization: `Client-ID ${Env.imgur.clientID}`,
      },
      body: data,
      crossDomain: true,
    })
    .pipe(rxOps.map(r => r.response.data.link))
    .toPromise();
}
