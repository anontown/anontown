import { combineEpics, Epic } from "redux-observable";
import { RootAction } from "../actions";
import { RootState } from "../state";

export const epics: Epic<
  RootAction,
  RootAction,
  RootState,
  unknown
> = combineEpics();
