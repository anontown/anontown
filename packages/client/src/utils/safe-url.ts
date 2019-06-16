export function safeURL(url: string) {
  if (url.indexOf("javascript:") === 0 || url.indexOf("data:") === 0) {
    return "";
  } else {
    return url;
  }
}
