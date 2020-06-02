import * as React from "react";

export type Effect<_S, A> = (dispatch: (action: A) => void) => void;

type Action<_S, A> =
  | { type: "APP_ACTION"; appAction: A }
  | { type: "CLEAR_EFFECTS" };

interface State<S, A> {
  appState: S;
  effects: ReadonlyArray<Effect<S, A>>;
}

export function useReducerWithEffects<S, A>(
  reducer: (prevState: S, action: A) => [S, Effect<S, A>],
  initialState: S,
): [S, (action: A) => void] {
  const [state, dispatch] = React.useReducer(
    (prevState: State<S, A>, action: Action<S, A>): State<S, A> => {
      switch (action.type) {
        case "APP_ACTION": {
          const [newAppState, newEffect] = reducer(
            prevState.appState,
            action.appAction,
          );
          return {
            ...prevState,
            appState: newAppState,
            effects: [...prevState.effects, newEffect],
          };
        }
        case "CLEAR_EFFECTS": {
          return {
            ...prevState,
            effects: [],
          };
        }
      }
    },
    { appState: initialState, effects: [] },
  );

  const appDispatch = React.useCallback((action: A) => {
    dispatch({ type: "APP_ACTION", appAction: action });
  }, []);

  React.useEffect(() => {
    if (state.effects.length !== 0) {
      const effects = state.effects;
      dispatch({ type: "CLEAR_EFFECTS" });
      for (const effect of effects) {
        effect(appDispatch);
      }
    }
  }, [state.effects]);

  return [state.appState, appDispatch];
}
