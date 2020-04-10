export * from "./actions";
export * from "./epics";
export * from "./reducers";
export * from "./state";

import { applyMiddleware, createStore, Middleware, Store } from "redux";
import { RootAction } from "./actions";
import { epics } from "./epics";
import { createRootReducer } from "./reducers";
import { RootState } from "./state";

import { routerMiddleware } from "connected-react-router";
import { createBrowserHistory } from "history";
import { logger } from "redux-logger";
import { createEpicMiddleware } from "redux-observable";
import { Mode } from "../env";

export const history = createBrowserHistory();

export function configureStore(): Store<RootState, RootAction> & {
  dispatch: unknown;
} {
  const middlewares: Array<Middleware> = [];
  const epicMiddleware = createEpicMiddleware<
    RootAction,
    RootAction,
    RootState,
    unknown
  >();

  middlewares.push(epicMiddleware);
  middlewares.push(routerMiddleware(history));
  if (Mode === "development") {
    middlewares.push(logger);
  }

  const store = createStore<RootState, RootAction, unknown, unknown>(
    createRootReducer(history),
    applyMiddleware(...middlewares),
  );

  epicMiddleware.run(epics);
  return store;
}
