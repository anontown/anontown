import { arrayImSet } from "@kgtkr/utils";

export function update<T extends { id: string }>(
  list: ReadonlyArray<T>,
  item: T,
): ReadonlyArray<T> {
  const index = list.findIndex(x => x.id === item.id);
  if (index !== -1) {
    return arrayImSet(index, item)(list);
  } else {
    return list;
  }
}
