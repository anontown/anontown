import { combineEpics, Epic } from "redux-observable";
import { RootAction } from "../actions";
import { State } from "../state";

export const epics: Epic<
  RootAction,
  RootAction,
  State,
  unknown
> = combineEpics();
