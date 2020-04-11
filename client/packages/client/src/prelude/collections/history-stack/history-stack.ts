import { Newtype, iso } from "newtype-ts";
import { RA, Option, O, pipe } from "../../fp-ts";

// [...prev, currentValue, ...post] という履歴になる
interface HistoryStackA<A> {
  readonly prev: ReadonlyArray<A>;
  readonly currentValue: A;
  readonly post: ReadonlyArray<A>;
}

export interface HistoryStack<A>
  extends Newtype<{ readonly HistoryStack: unique symbol }, HistoryStackA<A>> {}

function isoHistoryStack<A>() {
  return iso<HistoryStack<A>>();
}

export function getCurrentValue<A>(hs: HistoryStack<A>): A {
  return isoHistoryStack<A>().unwrap(hs).currentValue;
}

export function push<A>(x: A): (hs: HistoryStack<A>) => HistoryStack<A> {
  return isoHistoryStack<A>().modify(({ prev, currentValue }) => ({
    prev: RA.snoc(prev, currentValue),
    currentValue: x,
    post: [],
  }));
}

export function modifyPush<A>(
  f: (x: A) => A,
): (hs: HistoryStack<A>) => HistoryStack<A> {
  return hs => push(f(getCurrentValue(hs)))(hs);
}

export function undo<A>(hs: HistoryStack<A>): Option<HistoryStack<A>> {
  const { prev, currentValue, post } = isoHistoryStack<A>().unwrap(hs);
  return pipe(
    prev,
    RA.foldRight(
      () => O.none,
      (prevInit, prevLast) =>
        O.some(
          isoHistoryStack<A>().wrap({
            prev: prevInit,
            currentValue: prevLast,
            post: RA.cons(currentValue, post),
          }),
        ),
    ),
  );
}

export function possibleUndo<A>(hs: HistoryStack<A>): boolean {
  return O.isSome(undo(hs));
}

export function uncheckedUndo<A>(hs: HistoryStack<A>): HistoryStack<A> {
  return pipe(
    hs,
    undo,
    O.getOrElse(() => hs),
  );
}

export function redo<A>(hs: HistoryStack<A>): Option<HistoryStack<A>> {
  const { prev, currentValue, post } = isoHistoryStack<A>().unwrap(hs);
  return pipe(
    post,
    RA.foldLeft(
      () => O.none,
      (postHead, postTail) =>
        O.some(
          isoHistoryStack<A>().wrap({
            prev: RA.snoc(prev, currentValue),
            currentValue: postHead,
            post: postTail,
          }),
        ),
    ),
  );
}

export function possibleRedo<A>(hs: HistoryStack<A>): boolean {
  return O.isSome(redo(hs));
}

export function uncheckedRedo<A>(hs: HistoryStack<A>): HistoryStack<A> {
  return pipe(
    hs,
    redo,
    O.getOrElse(() => hs),
  );
}

export function of<A>(x: A): HistoryStack<A> {
  return isoHistoryStack<A>().wrap({
    prev: [],
    currentValue: x,
    post: [],
  });
}
