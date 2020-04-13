import { RA, pipe, O } from "./fp-ts";

export function update<T extends { id: string }>(item: T) {
  return (list: ReadonlyArray<T>): ReadonlyArray<T> =>
    pipe(
      list,
      RA.findIndex(x => x.id === item.id),
      O.chain(i => RA.updateAt(i, item)(list)),
      O.getOrElse(() => list),
    );
}
