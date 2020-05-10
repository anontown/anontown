import * as React from "react";

import { rx } from "../prelude";

export type Epic<A, S, R> = (
  action$: rx.Observable<A>,
  state$: rx.Observable<S>,
  env: R,
) => rx.Observable<A>;

export function useReducerWithObservable<A, S, R>(
  reducer: (prevState: S, action: A) => S,
  initialState: S,
  epic: Epic<A, S, R>,
  env: R,
): [S, (action: A) => void] {
  const state$ = React.useMemo(() => new rx.Subject<S>(), []);
  const action$ = React.useMemo(() => new rx.Subject<A>(), []);
  const [state, reducerDispatch] = React.useReducer(
    (prevState: S, action: A): S => {
      const newState = reducer(prevState, action);
      return newState;
    },
    initialState,
  );
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
