export * from "./actions";
export * from "./epics";
export * from "./reducers";
export * from "./state";

import { createStore, applyMiddleware, Store } from "redux";
import { RootAction } from "./actions";
import { reducer } from "./reducers";
import { State } from "./state";
import { epics } from "./epics";

import { createEpicMiddleware } from "redux-observable";

export function configureStore(): Store<State, RootAction> & {
  dispatch: unknown;
} {
  const epicMiddleware = createEpicMiddleware<
    RootAction,
    RootAction,
    State,
    unknown
  >();
  const store = createStore<State, RootAction, unknown, unknown>(
    reducer,
    applyMiddleware(epicMiddleware),
  );

  epicMiddleware.run(epics);
  return store;
}
