export * from "./actions";
export * from "./epics";
export * from "./reducers";
export * from "./state";

import { createStore, applyMiddleware, Store } from "redux";
import { Action } from "./actions";
import { reducer } from "./reducers";
import { State } from "./state";
import { epics } from "./epics";

import { createEpicMiddleware } from "redux-observable";

export function configureStore(): Store<State, Action> & {
  dispatch: unknown;
} {
  const epicMiddleware = createEpicMiddleware<Action, Action, State, unknown>();
  const store = createStore(reducer, applyMiddleware(epicMiddleware));

  epicMiddleware.run(epics);
  return store;
}
