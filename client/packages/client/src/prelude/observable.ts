import * as rx from "rxjs";
import * as zen from "zen-observable-ts";

export function zenToRx<A>(zen$: zen.Observable<A>): rx.Observable<A> {
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
