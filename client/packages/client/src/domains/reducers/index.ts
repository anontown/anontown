import { connectRouter } from "connected-react-router";
import { History } from "history";
import { combineReducers } from "redux";
import { RootAction } from "../actions";
import { initialAppState, RootState } from "../state";
import { composeReducers } from "./compose-reducers";

export const appReducer = composeReducers(initialAppState, []);

export function createRootReducer(history: History<any>) {
  return combineReducers<RootState, RootAction>({
    app: appReducer,
    router: connectRouter(history) as any,
  });
}
