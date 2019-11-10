export * from "./actions";
export * from "./epics";
export * from "./reducers";
export * from "./state";

import { createStore, applyMiddleware, Store, Middleware } from "redux";
import { RootAction } from "./actions";
import { createRootReducer } from "./reducers";
import { RootState } from "./state";
import { epics } from "./epics";

import { createEpicMiddleware } from "redux-observable";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import { Mode } from "../env";
import { logger } from "redux-logger";

export const history = createBrowserHistory();

export function configureStore(): Store<RootState, RootAction> & {
  dispatch: unknown;
} {
  const middlewares: Middleware[] = [];
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
