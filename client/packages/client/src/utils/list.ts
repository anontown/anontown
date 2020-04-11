import { arrayImSet } from "@kgtkr/utils";
import * as Im from "immutable";

export function update<T extends { id: string }>(list: Array<T>, item: T) {
  const index = list.findIndex(x => x.id === item.id);
  if (index !== -1) {
    return arrayImSet(index, item)(list);
  } else {
    return list;
  }
}

export function updateIm<T extends { id: string }>(list: Im.List<T>, item: T) {
  const index = list.findIndex(x => x.id === item.id);
  if (index !== -1) {
    return list.set(index, item);
  } else {
    return list;
  }
}
