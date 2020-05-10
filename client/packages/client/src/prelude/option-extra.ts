import { O, Option } from "./fp-ts-exports";

export const foldEffect = O.fold;

export function fromSome<A>(x: Option<A>): A {
  if (O.isSome(x)) {
    return x.value;
  } else {
    throw new Error("x is None");
  }
}
