import * as CryptoJS from "crypto-js";
import { Env } from "../env";

export function getCamoUrl(url: string): string {
  // 既にHTTPSなら
  if (url.indexOf("https://") === 0) {
    return url;
  }

  const digest = CryptoJS.HmacSHA1(url, Env.camo.key);
  const urlEncode = encodeURIComponent(url);
  return `${Env.camo.origin}/${digest}?url=${urlEncode}`;
}
