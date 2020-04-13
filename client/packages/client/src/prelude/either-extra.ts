import { E, Either } from "./fp-ts";

export const foldEffect = E.fold;

export function fromRight<L, R>(x: Either<L, R>): R {
  if (E.isRight(x)) {
    return x.right;
  } else {
    throw new Error("x is Left");
  }
}

export function fromLeft<L, R>(x: Either<L, R>): L {
  if (E.isLeft(x)) {
    return x.left;
  } else {
    throw new Error("x is Left");
  }
}
