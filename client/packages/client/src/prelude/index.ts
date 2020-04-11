export * from "./fp-ts-exports";

import { RS, eqString, Eq, ReadonlyRecord, Option, RR } from "./fp-ts-exports";

export const eqStringReadonlySet: Eq<ReadonlySet<string>> = RS.getEq(eqString);

export function readonlyRecordModify<K extends string, A>(
  record: ReadonlyRecord<K, A>,
  key: K,
  f: (x: Option<A>) => A,
): ReadonlyRecord<K, A> {
  return RR.insertAt(key, f(RR.lookup(key, record)))(record);
}
