import { RS, EqT, Eq, ReadonlyRecord, Option, RR } from "./exports";

export const eqStringReadonlySet: Eq<ReadonlySet<string>> = RS.getEq(
  EqT.eqString,
);

export function readonlyRecordModify<K extends string, A>(
  record: ReadonlyRecord<K, A>,
  key: K,
  f: (x: Option<A>) => A,
): ReadonlyRecord<K, A> {
  return RR.insertAt(key, f(RR.lookup(key, record)))(record);
}
