import * as zen from "zen-observable-ts";
import { IO } from "./fp-ts-exports";
import { Task } from "fp-ts/lib/Task";
import { rx, rxOps } from "./rx-exports";

export function fromZen<A>(zen$: zen.Observable<A>): rx.Observable<A> {
  return new rx.Observable(subscriber => {
    const subs = zen$.subscribe({
      next: x => subscriber.next(x),
      error: e => subscriber.error(e),
      complete: () => subscriber.complete(),
    });

    return () => {
      subs.unsubscribe();
    };
  });
}

export function fromIO<A>(ioA: IO<A>): rx.Observable<A> {
  return rx.defer(() => rx.of(ioA()));
}

export function fromIOVoid(io: IO<void>): rx.Observable<never> {
  return rx.defer(() => {
    io();
    return rx.never();
  });
}

export function fromTask<A>(taskA: Task<A>): rx.Observable<A> {
  return rx.defer(() => rx.from(taskA()));
}

/**
 * 最低でも一定時間遅延するオペレーター
 */
export function delayMinMergeMap<A, B>(
  ab: (a: A, index: number) => rx.Observable<[number | null, B]>,
): rx.OperatorFunction<A, B> {
  return (a$: rx.Observable<A>): rx.Observable<B> =>
    a$.pipe(
      rxOps.mergeMap((a, index) => {
        const startTime = Date.now();
        return ab(a, index).pipe(
          rxOps.delayWhen(([ms, _b]) =>
            ms !== null
              ? rx.timer(Math.max(0, ms + startTime - Date.now()))
              : rx.of(null),
          ),
          rxOps.map(([_ms, b]) => b),
        );
      }),
    );
}
