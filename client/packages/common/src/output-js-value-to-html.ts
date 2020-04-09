export function outputJsValueToHtml(val: unknown): string {
  return JSON.stringify(val).replace(/</g, "\\u003c");
}
