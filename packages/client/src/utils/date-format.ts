export function format(value: Date | string | number): string {
  const now = new Date();

  const date =
    typeof value === "string"
      ? new Date(value)
      : typeof value === "number"
      ? new Date(value)
      : value;

  const timespan = now.valueOf() - date.valueOf();

  // 一秒未満
  if (timespan < 1000) {
    return "現在";
  }

  // 一分未満
  if (timespan < 60 * 1000) {
    return Math.floor(timespan / 1000) + "秒前";
  }

  // 一時間未満
  if (timespan < 60 * 60 * 1000) {
    return Math.floor(timespan / 1000 / 60) + "分前";
  }

  // 一日未満
  if (timespan < 24 * 60 * 60 * 1000) {
    return Math.floor(timespan / 1000 / 60 / 60) + "時間前";
  }

  return (
    ("0000" + date.getFullYear()).slice(-4) +
    "/" +
    ("00" + (date.getMonth() + 1)).slice(-2) +
    "/" +
    ("00" + date.getDate()).slice(-2) +
    "(" +
    ["日", "月", "火", "水", "木", "金", "土"][date.getDay()] +
    ") " +
    ("00" + date.getHours()).slice(-2) +
    ":" +
    ("00" + date.getMinutes()).slice(-2)
  );
}
