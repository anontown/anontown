import * as G from "../../generated/graphql";
import { UserData } from "../../domains/entities";

export interface State {
  topicId: string;
  existUnread: boolean;
  isJumpDialog: boolean;
  isAutoScrollDialog: boolean;
  isNGDialog: boolean;
  userData: UserData | null;
  autoScrollSpeed: number;
  isAutoScroll: boolean;
  jumpResId: string | null;
  // 以下の値が全てnullでなくなれば準備完了
  topic: G.TopicFragment | null;
  now: Date | null;
  reses: ReadonlyArray<G.ResFragment> | null;
  jumpValue: number | null;
  fetchingOld: boolean;
  fetchingNew: boolean;
}

export function State({
  userData,
  topicId,
}: {
  userData: UserData | null;
  topicId: string;
}): State {
  return {
    topicId,
    now: null,
    existUnread: false,
    isJumpDialog: false,
    isAutoScrollDialog: false,
    isNGDialog: false,
    userData,
    topic: null,
    reses: null,
    autoScrollSpeed: 15,
    isAutoScroll: false,
    jumpValue: null,
    jumpResId: null,
    fetchingOld: false,
    fetchingNew: false,
  };
}
