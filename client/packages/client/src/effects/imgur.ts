import * as rx from "rxjs/ajax";
import * as op from "rxjs/operators";

import { Env } from "../env";

export function upload(data: FormData): Promise<string> {
  return rx
    .ajax({
      url: "https://api.imgur.com/3/image",
      method: "POST",
      headers: {
        Authorization: `Client-ID ${Env.imgur.clientID}`,
      },
      body: data,
      crossDomain: true,
    })
    .pipe(op.map(r => r.response.data.link))
    .toPromise();
}
