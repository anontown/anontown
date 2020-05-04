import * as React from "react";

import { Observable, Subject } from "rxjs";

export type Epic<A, S, R> = (
  action$: Observable<A>,
  state$: Observable<S>,
  env: R,
) => Observable<A>;

export function useReducerWithObservable<A, S, R>(
  reducer: (prevState: S, action: A) => S,
  initialState: S,
  epic: Epic<A, S, R>,
  env: R,
): [S, (action: A) => void] {
  const state$ = React.useMemo(() => new Subject<S>(), []);
  const action$ = React.useMemo(() => new Subject<A>(), []);
  const [state, reducerDispatch] = React.useReducer(reducer, initialState);
  const dispatch = React.useCallback((action: A) => {
    reducerDispatch(action);
    action$.next(action);
  }, []);

  React.useEffect(() => {
    const subs = epic(action$, state$, env).subscribe({
      next: action => {
        dispatch(action);
      },
    });

    return () => {
      subs.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    state$.next(state);
  }, [state]);

  return [state, dispatch];
}
