export * from "./actions";
export * from "./epics";
export * from "./reducers";
export * from "./state";

import { createStore, applyMiddleware, Store } from "redux";
import { RootAction } from "./actions";
import { createRootReducer } from "./reducers";
import { RootState } from "./state";
import { epics } from "./epics";

import { createEpicMiddleware } from "redux-observable";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";

export const history = createBrowserHistory();

export function configureStore(): Store<RootState, RootAction> & {
  dispatch: unknown;
} {
  const epicMiddleware = createEpicMiddleware<
    RootAction,
    RootAction,
    RootState,
    unknown
  >();
  const store = createStore<RootState, RootAction, unknown, unknown>(
    createRootReducer(history),
    applyMiddleware(epicMiddleware, routerMiddleware(history)),
  );

  epicMiddleware.run(epics);
  return store;
}
