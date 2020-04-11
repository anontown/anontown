export function safeURL(url: string) {
  if (url.startsWith("javascript:") || url.startsWith("data:")) {
    return "";
  } else {
    return url;
  }
}
