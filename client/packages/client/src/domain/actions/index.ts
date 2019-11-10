import { createAction, ActionType } from "typesafe-actions";

export const nop = createAction("NOP")();

export const actions = { nop };

export type RootAction = ActionType<{
  actions: typeof actions;
}>;
