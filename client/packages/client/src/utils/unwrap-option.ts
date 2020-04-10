import { Option, O } from "../prelude";

export function unwrapOption<A>(x: Option<A>): A {
  if (O.isSome(x)) {
    return x.value;
  } else {
    throw new Error();
  }
}
