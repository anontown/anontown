import { RA, pipe, O } from "../prelude";

export function update<T extends { id: string }>(
  list: ReadonlyArray<T>,
  item: T,
): ReadonlyArray<T> {
  return pipe(
    list,
    RA.findIndex(x => x.id === item.id),
    O.chain(i => RA.updateAt(i, item)(list)),
    O.getOrElse(() => list),
  );
}
