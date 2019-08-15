export type OrdSet<T, U> = {
  array: T[];
  compare: (x: T, y: T) => number;
  uniqueBy: (x: T) => U;
};

export function toArray<T, U>(set: OrdSet<T, U>): T[] {
  return set.array;
}

export function make<T, U>(
  compare: (x: T, y: T) => number,
  uniqueBy: (x: T) => U,
): OrdSet<T, U> {
  return { array: [], compare, uniqueBy };
}

export function push<T, U>(set: OrdSet<T, U>, array: T[]): OrdSet<T, U> {
  return normilize({ ...set, array: [...set.array, ...array] });
}

function normilize<T, U>(set: OrdSet<T, U>): OrdSet<T, U> {
  const unique = set.array
    .reduce((prev, x) => prev.set(set.uniqueBy(x), x), new Map<U, T>())
    .values();
  return {
    ...set,
    array: [...unique].sort(set.compare),
  };
}
