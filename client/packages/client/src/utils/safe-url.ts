export function safeURL(url: string): string {
  if (url.startsWith("javascript:") || url.startsWith("data:")) {
    return "";
  } else {
    return url;
  }
}
