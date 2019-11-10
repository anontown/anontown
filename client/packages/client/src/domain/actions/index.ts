import { createAction, ActionType } from "typesafe-actions";
import { routerActions } from "connected-react-router";

export const nop = createAction("NOP")();

export const appActions = { nop };

export type RootAction = ActionType<{
  app: typeof appActions;
  router: typeof routerActions;
}>;
