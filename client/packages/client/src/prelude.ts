export { eqString, eqNumber, eqBoolean, Eq } from "fp-ts/lib/Eq";
export { ordBoolean, ordString, ordNumber, Ord } from "fp-ts/lib/Ord";
export * as RA from "fp-ts/lib/ReadonlyArray";
export * as RM from "fp-ts/lib/ReadonlyMap";
export * as RS from "fp-ts/lib/ReadonlySet";
export * as RR from "fp-ts/lib/ReadonlyRecord";
export * as M from "fp-ts/lib/Map";
export * as S from "fp-ts/lib/Set";
export { ReadonlyRecord } from "fp-ts/lib/ReadonlyRecord";
export * as O from "fp-ts/lib/Option";
export { Option } from "fp-ts/lib/Option";
export * as E from "fp-ts/lib/Either";
export { Either } from "fp-ts/lib/Either";
export { unwrapOption } from "./utils";
export { pipe } from "fp-ts/lib/pipeable";
export {
  flow,
  identity,
  constant,
  Endomorphism,
  Refinement,
  Predicate,
  Lazy,
} from "fp-ts/lib/function";

import * as RS from "fp-ts/lib/ReadonlySet";
import { eqString, Eq } from "fp-ts/lib/Eq";
import { ReadonlyRecord } from "fp-ts/lib/ReadonlyRecord";
import { Option } from "fp-ts/lib/Option";
import * as RR from "fp-ts/lib/ReadonlyRecord";

export const eqStringReadonlySet: Eq<ReadonlySet<string>> = RS.getEq(eqString);

export function readonlyRecordModify<K extends string, A>(
  record: ReadonlyRecord<K, A>,
  key: K,
  f: (x: Option<A>) => A,
): ReadonlyRecord<K, A> {
  return RR.insertAt(key, f(RR.lookup(key, record)))(record);
}
