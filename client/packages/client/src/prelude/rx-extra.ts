import * as rx from "rxjs";
import * as zen from "zen-observable-ts";
import { IO } from "./fp-ts";
import { Task } from "fp-ts/lib/Task";

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
