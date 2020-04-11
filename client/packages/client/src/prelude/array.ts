import { RA, Ord, O } from "./fp-ts";

/**
 * 配列xsに配列ysをマージし、配列を返す。引数も還り値もキーで昇順にソート済みでキーの重複がない。
 * キーが重複した要素はysの要素で置換される
 */
export function mergeAndUniqSortedArray<K>(ord: Ord<K>) {
  return <A>(f: (a: A) => K, ys: ReadonlyArray<A>) => (
    xs: ReadonlyArray<A>,
  ): ReadonlyArray<A> => {
    let ix = 0;
    let iy = 0;
    let result: Array<A> = [];
    while (true) {
      const ox = RA.lookup(ix, xs);
      const oy = RA.lookup(iy, ys);

      if (O.isSome(ox)) {
        const x = ox.value;
        if (O.isSome(oy)) {
          const y = oy.value;
          switch (ord.compare(f(x), f(y))) {
            case 0: {
              result.push(y);
              ix++;
              iy++;
              break;
            }
            case 1: {
              result.push(y);
              iy++;
              break;
            }
            case -1: {
              result.push(x);
              ix++;
              break;
            }
          }
        } else {
          result.push(x);
          ix++;
        }
      } else {
        if (O.isSome(oy)) {
          const y = oy.value;
          result.push(y);
          iy++;
        } else {
          return result;
        }
      }
    }
  };
}
