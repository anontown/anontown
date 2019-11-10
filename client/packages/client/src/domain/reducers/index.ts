import { initialAppState, RootState } from "../state";
import { composeReducers } from "./compose-reducers";
import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { RootAction } from "../actions";
import { History } from "history";

export const appReducer = composeReducers(initialAppState, []);

export function createRootReducer(history: History<any>) {
  return combineReducers<RootState, RootAction>({
    app: appReducer,
    router: connectRouter(history) as any,
  });
}
