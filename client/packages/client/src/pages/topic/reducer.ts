import * as G from "../../generated/graphql";
import { pipe, O, RA, Monoid_, ArrayExtra, Ord, OrdT } from "../../prelude";

import { Action } from "./action";
import { State } from "./state";

function getKeyFromRes(x: G.ResFragment): ResKey {
  return [-new Date(x.date).valueOf(), x.id];
}

type ResKey = [number, string];
const ordListItemKey: Ord<ResKey> = OrdT.getTupleOrd(
  OrdT.ordNumber,
  OrdT.ordString,
);

function mergeReses(
  xs: ReadonlyArray<G.ResFragment>,
  ys: ReadonlyArray<G.ResFragment>,
): ReadonlyArray<G.ResFragment> {
  return ArrayExtra.mergeAndUniqSortedArray(ordListItemKey)(getKeyFromRes, ys)(
    xs,
  );
}

export function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "INIT": {
      return {
        ...State({ userData: prevState.userData, topicId: action.topicId }),
        now: action.now,
        jumpValue: action.now.valueOf(),
      };
    }
    case "FETCH_TOPIC_REQUEST": {
      return prevState;
    }
    case "FETCH_TOPIC_SUCCESS": {
      return {
        ...prevState,
        topic: action.topic,
      };
    }
    case "FETCH_TOPIC_FAILURE": {
      return prevState;
    }
    case "FETCH_INIT_RES_REQUEST": {
      return prevState;
    }
    case "FETCH_INIT_RES_SUCCESS": {
      return {
        ...prevState,
        existUnread: false,
        reses: mergeReses(action.beforeReses, action.afterReses),
        jumpResId: pipe(
          [RA.last(action.afterReses), RA.head(action.beforeReses)],
          Monoid_.fold(O.getFirstMonoid()),
          O.map(res => res.id),
          O.toNullable,
        ),
      };
    }
    case "FETCH_INIT_RES_FAILURE": {
      return prevState;
    }
    case "SCROLL_TO_FIRST": {
      return {
        ...prevState,
        existUnread: false,
      };
    }
    case "FETCH_NEW_RES_REQUEST": {
      return {
        ...prevState,
        fetchingNew: true,
      };
    }
    case "FETCH_NEW_RES_SUCCESS": {
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], action.reses),
        fetchingNew: false,
      };
    }
    case "FETCH_NEW_RES_FAILURE": {
      return {
        ...prevState,
        fetchingNew: false,
      };
    }
    case "SCROLL_TO_LAST": {
      return prevState;
    }
    case "FETCH_OLD_RES_REQUEST": {
      return {
        ...prevState,
        fetchingOld: true,
      };
    }
    case "FETCH_OLD_RES_SUCCESS": {
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], action.reses),
        fetchingOld: false,
      };
    }
    case "FETCH_OLD_RES_FAILURE": {
      return {
        ...prevState,
        fetchingOld: false,
      };
    }
    case "CLICK_OPEN_AUTO_SCROLL_MODAL": {
      return {
        ...prevState,
        isAutoScrollDialog: true,
      };
    }
    case "CLICK_CLOSE_AUTO_SCROLL_MODAL": {
      return {
        ...prevState,
        isAutoScrollDialog: false,
      };
    }
    case "CHANGE_ENABLE_AUTO_SCROLL": {
      return {
        ...prevState,
        isAutoScroll: action.value,
      };
    }
    case "CHANGE_AUTO_SCROLL_SPEED": {
      return {
        ...prevState,
        autoScrollSpeed: action.value,
      };
    }
    case "CLICK_OPEN_NG_MODAL": {
      return {
        ...prevState,
        isNGDialog: true,
      };
    }
    case "CLICK_CLOSE_NG_MODAL": {
      return {
        ...prevState,
        isNGDialog: false,
      };
    }
    case "UPDATE_NG": {
      return prevState;
    }
    case "CLICK_OPEN_JUMP_MODAL": {
      return {
        ...prevState,
        isJumpDialog: true,
      };
    }
    case "CLICK_CLOSE_JUMP_MODAL": {
      return {
        ...prevState,
        isJumpDialog: false,
      };
    }
    case "CHANGE_JUMP_VALUE": {
      return {
        ...prevState,
        jumpValue: action.value,
      };
    }
    case "CLICK_JUMP": {
      return prevState;
    }
    case "TOGGLE_FAVO": {
      return prevState;
    }
    case "CHANGE_CURRENT_RES": {
      return prevState;
    }
    case "SUBMIT_RES": {
      return prevState;
    }
    case "UPDATE_USER_DATA": {
      return {
        ...prevState,
        userData: action.userData,
      };
    }
    case "RECEIVE_NEW_RES": {
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], [action.res]),
        existUnread: true,
        topic:
          prevState.topic !== null
            ? {
                ...prevState.topic,
                resCount: action.count,
              }
            : null,
      };
    }
    case "UPDATE_RES":
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], [action.res]),
      };
    case "RESET_JUMP_RES": {
      return {
        ...prevState,
        jumpResId: null,
      };
    }
  }
}
