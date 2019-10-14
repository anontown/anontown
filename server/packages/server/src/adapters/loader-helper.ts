import * as DataLoader from "dataloader";

function sort<T extends { id: string }>(
  ids: string[],
  data: T[],
): (T | Error)[] {
  const map = new Map(data.map<[string, T]>(x => [x.id, x]));
  return ids.map(x => map.get(x) || new Error());
}

export function loader<T extends { id: string }>(
  f: (ids: string[]) => Promise<T[]>,
): DataLoader<string, T> {
  return new DataLoader<string, T>(async ids => {
    const data = await f(ids);
    return sort(ids, data);
  });
}
