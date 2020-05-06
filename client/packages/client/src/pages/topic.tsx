import { routes } from "@anontown/common/lib/route";
import { useApolloClient } from "@apollo/react-hooks";
import {
  FontIcon,
  IconButton,
  MenuItem,
  Paper,
  RaisedButton,
  Slider,
  Toggle,
} from "material-ui";
import moment from "moment";
import * as React from "react";
import { Link } from "react-router-dom";
import { useTitle } from "react-use";
import * as rx from "rxjs";
import * as ops from "rxjs/operators";
import useRouter from "use-react-router";
import {
  Modal,
  NG,
  Page,
  Res,
  ResWrite,
  StreamScroll,
  TopicFavo,
} from "../components";
import { PopupMenu } from "../components/popup-menu";
import * as G from "../generated/graphql";
import { useFunctionRef, useUserContext, useValueRef } from "../hooks";
import { queryResultConvert } from "../utils";
import * as style from "./topic.scss";
import {
  pipe,
  O,
  RA,
  Monoid_,
  ArrayExtra,
  Ord,
  OrdT,
  sleep,
  isNotNull,
  zenToRx,
} from "../prelude";
import { Sto, UserData } from "../domains/entities";
import { InfiniteScroll } from "../components/infinite-scroll";
import ApolloClient from "apollo-client";
import { Epic } from "../hooks/use-reducer-with-observable";
import { Observable } from "rxjs";
// TODO:NGのtransparent

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

/* lazy use使う */
function makeUseFetch(id: string) {
  return () => {
    const apolloClient = useApolloClient();
    return async (date: G.DateQuery): Promise<ReadonlyArray<G.ResFragment>> => {
      const result = await apolloClient.query<
        G.FindResesQuery,
        G.FindResesQueryVariables
      >({
        query: G.FindResesDocument,
        variables: { query: { topic: id, date } },
      });
      return result.data.reses;
    };
  };
}

interface State {
  topicId: string;
  existUnread: boolean;
  isJumpDialog: boolean;
  isAutoScrollDialog: boolean;
  isNGDialog: boolean;
  userData: UserData | null;
  autoScrollSpeed: number;
  isAutoScroll: boolean;
  currentResId: string | null;
  // 以下の値が全てnullでなくなれば準備完了
  topic: G.TopicFragment | null;
  now: Date | null;
  reses: ReadonlyArray<G.ResFragment> | null;
  jumpValue: number | null;
}

function State({
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
    currentResId: null,
  };
}

type Action =
  | { type: "INIT"; topicId: string; now: Date }
  | { type: "FETCH_TOPIC_REQUEST" }
  | { type: "FETCH_TOPIC_SUCCESS"; topic: G.TopicFragment }
  | { type: "FETCH_TOPIC_FAILURE" }
  | { type: "FETCH_INIT_RES_REQUEST" }
  | {
      type: "FETCH_INIT_RES_SUCCESS";
      afterReses: ReadonlyArray<G.ResFragment>;
      beforeReses: ReadonlyArray<G.ResFragment>;
    }
  | { type: "FETCH_INIT_RES_FAILURE" }
  | { type: "SCROLL_TO_FIRST" }
  | { type: "FETCH_NEW_RES_REQUEST" }
  | { type: "FETCH_NEW_RES_SUCCESS"; reses: ReadonlyArray<G.ResFragment> }
  | { type: "FETCH_NEW_RES_FAILURE" }
  | { type: "SCROLL_TO_LAST" }
  | { type: "FETCH_OLD_RES_REQUEST" }
  | { type: "FETCH_OLD_RES_SUCCESS"; reses: ReadonlyArray<G.ResFragment> }
  | { type: "FETCH_OLD_RES_FAILURE" }
  | { type: "CLICK_OPEN_AUTO_SCROLL_MODAL" }
  | { type: "CLICK_CLOSE_AUTO_SCROLL_MODAL" }
  | { type: "CHANGE_ENABLE_AUTO_SCROLL"; value: boolean }
  | { type: "CLICK_OPEN_NG_MODAL" }
  | { type: "CLICK_CLOSE_NG_MODAL" }
  | { type: "UPDATE_NG"; storage: Sto.Storage }
  | { type: "CLICK_OPEN_JUMP_MODAL" }
  | { type: "CLICK_CLOSE_JUMP_MODAL" }
  | { type: "CHANGE_JUMP_VALUE"; value: number }
  | { type: "CLICK_JUMP" }
  | { type: "TOGGLE_FAVO" }
  | { type: "CHANGE_CURRENT_RES"; res: G.ResFragment | null }
  | { type: "SUBMIT_RES"; storage: Sto.Storage }
  | { type: "UPDATE_USER_DATA"; userData: UserData | null }
  | { type: "RECEIVE_NEW_RES"; res: G.ResFragment; count: number };

interface Env {
  apolloClient: ApolloClient<object>;
  updateUserData: (userData: UserData | null) => void;
}

function storageSaveDate(
  { count, date }: { count?: number; date?: string },
  state: State,
  env: Env,
): rx.Observable<Action> {
  if (state.userData === null || state.topic === null || state.reses === null) {
    return rx.never();
  }
  const storage = state.userData.storage;
  const odate = pipe(
    [
      O.fromNullable(date),
      pipe(
        storage,
        Sto.getTopicRead(state.topicId),
        O.map(storageRes => Sto.topicReadDateLens.get(storageRes)),
      ),
      pipe(
        state.reses,
        RA.head,
        O.map(first => first.date),
      ),
    ],
    Monoid_.fold(O.getFirstMonoid()),
  );

  if (O.isSome(odate)) {
    env.updateUserData({
      ...state.userData,
      storage: Sto.setTopicRead(
        state.topicId,
        Sto.makeTopicRead({
          date: odate.value,
          count: count ?? state.topic.resCount,
        }),
      )(storage),
    });
  }

  return rx.never();
}

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "INIT": {
      return {
        ...State({ userData: prevState.userData, topicId: action.topicId }),
        now: action.now,
        jumpValue: action.now.valueOf(),
      };
    }
    case "FETCH_TOPIC_REQUEST": {
      return {
        ...prevState,
      };
    }
    case "FETCH_TOPIC_SUCCESS": {
      return {
        ...prevState,
        topic: action.topic,
      };
    }
    case "FETCH_TOPIC_FAILURE": {
      return {
        ...prevState,
      };
    }
    case "FETCH_INIT_RES_REQUEST": {
      return {
        ...prevState,
      };
    }
    case "FETCH_INIT_RES_SUCCESS": {
      return {
        ...prevState,
        existUnread: false,
        reses: mergeReses(action.beforeReses, action.afterReses),
        currentResId: pipe(
          [RA.last(action.afterReses), RA.head(action.beforeReses)],
          Monoid_.fold(O.getFirstMonoid()),
          O.map(res => res.id),
          O.toNullable,
        ),
      };
    }
    case "FETCH_INIT_RES_FAILURE": {
      return {
        ...prevState,
      };
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
      };
    }
    case "FETCH_NEW_RES_SUCCESS": {
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], action.reses),
      };
    }
    case "FETCH_NEW_RES_FAILURE": {
      return {
        ...prevState,
      };
    }
    case "SCROLL_TO_LAST": {
      return {
        ...prevState,
      };
    }
    case "FETCH_OLD_RES_REQUEST": {
      return {
        ...prevState,
      };
    }
    case "FETCH_OLD_RES_SUCCESS": {
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], action.reses),
      };
    }
    case "FETCH_OLD_RES_FAILURE": {
      return {
        ...prevState,
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
      return {
        ...prevState,
      };
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
      return {
        ...prevState,
      };
    }
    case "TOGGLE_FAVO": {
      return {
        ...prevState,
      };
    }
    case "CHANGE_CURRENT_RES": {
      return {
        ...prevState,
        currentResId: action.res?.id ?? null,
      };
    }
    case "SUBMIT_RES": {
      return {
        ...prevState,
      };
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
  }
}

function fetchTopic(
  { topicId }: { topicId: string },
  env: Env,
): Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_TOPIC_REQUEST" }),
    rx
      .from(
        env.apolloClient.query<G.FindTopicsQuery, G.FindTopicsQueryVariables>({
          query: G.FindTopicsDocument,
          variables: { query: { id: [topicId] } },
        }),
      )
      .pipe(
        ops.mergeMap(res =>
          pipe(
            RA.head(res.data.topics),
            O.map(topic =>
              rx.of<Action>({ type: "FETCH_TOPIC_SUCCESS", topic }),
            ),
            O.getOrElse<rx.Observable<Action>>(() =>
              rx.throwError(new Error()),
            ),
          ),
        ),
        ops.catchError(_e => rx.of<Action>({ type: "FETCH_TOPIC_FAILURE" })),
      ),
  );
}

function fetchRes(
  { topicId, dateQuery }: { topicId: string; dateQuery: G.DateQuery },
  env: Env,
): Observable<ReadonlyArray<G.ResFragment>> {
  return rx
    .from(
      env.apolloClient.query<G.FindResesQuery, G.FindResesQueryVariables>({
        query: G.FindResesDocument,
        variables: {
          query: {
            topic: topicId,
            date: dateQuery,
          },
        },
      }),
    )
    .pipe(ops.map(res => res.data.reses));
}

function fetchInitRes(
  { topicId, base }: { topicId: string; base: Date },
  env: Env,
): Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_INIT_RES_REQUEST" }),
    rx
      .combineLatest(
        fetchRes(
          { topicId, dateQuery: { type: "lte", date: base.toISOString() } },
          env,
        ),
        fetchRes(
          { topicId, dateQuery: { type: "gt", date: base.toISOString() } },
          env,
        ),
      )
      .pipe(
        ops.map(
          ([before, after]): Action => ({
            type: "FETCH_INIT_RES_SUCCESS",
            beforeReses: before,
            afterReses: after,
          }),
        ),
        ops.catchError(_e => rx.of<Action>({ type: "FETCH_INIT_RES_FAILURE" })),
      ),
  );
}

function fetchNewRes(
  { topicId, base }: { topicId: string; base: Date },
  env: Env,
): Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_NEW_RES_REQUEST" }),
    fetchRes(
      { topicId, dateQuery: { type: "gt", date: base.toISOString() } },
      env,
    ).pipe(
      ops.map(
        (reses): Action => ({
          type: "FETCH_NEW_RES_SUCCESS",
          reses,
        }),
      ),
      ops.catchError(_e => rx.of<Action>({ type: "FETCH_NEW_RES_FAILURE" })),
    ),
  );
}

function fetchOldRes(
  { topicId, base }: { topicId: string; base: Date },
  env: Env,
): Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_OLD_RES_REQUEST" }),
    fetchRes(
      { topicId, dateQuery: { type: "lt", date: base.toISOString() } },
      env,
    ).pipe(
      ops.map(
        (reses): Action => ({
          type: "FETCH_OLD_RES_SUCCESS",
          reses,
        }),
      ),
      ops.catchError(_e => rx.of<Action>({ type: "FETCH_OLD_RES_FAILURE" })),
    ),
  );
}

const epic: Epic<Action, State, Env> = (action$, state$, env) =>
  rx.merge(
    action$.pipe(
      ops.map(action => (action.type === "INIT" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(([action, state]) =>
        rx.merge(
          zenToRx(
            env.apolloClient.subscribe<
              G.ResAddedSubscription,
              G.ResAddedSubscriptionVariables
            >({
              variables: { topic: action.topicId },
              query: G.ResAddedDocument,
            }),
          ).pipe(
            ops.map(res => res.data ?? null),
            ops.filter(isNotNull),
            ops.mergeMap(res =>
              rx.merge(
                storageSaveDate({ count: res.resAdded.count }, state, env),
                rx.of<Action>({
                  type: "RECEIVE_NEW_RES",
                  res: res.resAdded.res,
                  count: res.resAdded.count,
                }),
              ),
            ),
          ),
          fetchTopic({ topicId: action.topicId }, env),
          fetchInitRes(
            {
              topicId: action.topicId,
              base: pipe(
                O.fromNullable(state.userData),
                O.chain(userData =>
                  Sto.getTopicRead(action.topicId)(userData.storage),
                ),
                O.map(Sto.topicReadDateLens.get),
                O.map(date => new Date(date)),
                O.getOrElse(() => action.now),
              ),
            },
            env,
          ),
        ),
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "SCROLL_TO_FIRST" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(([_action, state]) =>
        pipe(
          O.fromNullable(state.reses),
          O.chain(RA.head),
          O.map(res =>
            fetchNewRes(
              { topicId: state.topicId, base: new Date(res.date) },
              env,
            ),
          ),
          O.getOrElse(() => rx.of<Action>()),
        ),
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "SCROLL_TO_LAST" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(([_action, state]) =>
        pipe(
          O.fromNullable(state.reses),
          O.chain(RA.last),
          O.map(res =>
            fetchOldRes(
              { topicId: state.topicId, base: new Date(res.date) },
              env,
            ),
          ),
          O.getOrElse(() => rx.of<Action>()),
        ),
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "UPDATE_NG" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(
        ([action, state]): Observable<Action> => {
          if (state.userData !== null) {
            env.updateUserData({ ...state.userData, storage: action.storage });
          }
          return rx.never();
        },
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "CLICK_JUMP" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.map(([_action, state]) =>
        state.jumpValue !== null
          ? { topicId: state.topicId, jumpValue: state.jumpValue }
          : null,
      ),
      ops.filter(isNotNull),
      ops.mergeMap(({ topicId, jumpValue }) =>
        fetchInitRes(
          {
            topicId: topicId,
            base: new Date(jumpValue),
          },
          env,
        ),
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "TOGGLE_FAVO" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(
        ([_action, state]): Observable<Action> => {
          if (state.userData !== null) {
            const isFavo = Sto.isTopicFavo(state.topicId)(
              state.userData.storage,
            );
            const storage = state.userData.storage;
            env.updateUserData({
              ...state.userData,
              storage: (isFavo ? Sto.unfavoTopic : Sto.favoTopic)(
                state.topicId,
              )(storage),
            });
          }
          return rx.never();
        },
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "SUBMIT_RES" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(
        ([action, state]): Observable<Action> => {
          if (state.userData !== null) {
            env.updateUserData({ ...state.userData, storage: action.storage });
          }
          return rx.never();
        },
      ),
    ),
  );

export const TopicPage = (_props: {}) => {
  const { match } = useRouter<{ id: string }>();
  // TODO: useMemoで副作用を起こさない
  const now = React.useMemo(() => new Date().toISOString(), []);
  const [existUnread, setExistUnread] = React.useState(false);
  const [isJumpDialog, setIsJumpDialog] = React.useState(false);
  const [isAutoScrollDialog, setIsAutoScrollDialog] = React.useState(false);
  const [isNGDialog, setIsNGDialog] = React.useState(false);
  const user = useUserContext();
  const topics = G.useFindTopicsQuery({
    variables: { query: { id: [match.params.id] } },
  });
  queryResultConvert(topics);
  const topic = topics.data !== undefined ? topics.data.topics[0] : null;
  const [autoScrollSpeed, setAutoScrollSpeed] = React.useState(15);
  const [isAutoScroll, setIsAutoScroll] = React.useState(false);
  const scrollNewItem = React.useRef(new rx.ReplaySubject<string>(1));
  const [items, setItems] = React.useState<ReadonlyArray<G.ResFragment>>([]);
  const itemsRef = useValueRef(items);
  const initDate = React.useMemo(
    () =>
      pipe(
        O.fromNullable(user.value),
        O.chain(userData =>
          Sto.getTopicRead(match.params.id)(userData.storage),
        ),
        O.map(Sto.topicReadDateLens.get),
        O.getOrElse(() => now),
      ),
    [user.value],
  );
  const [jumpValue, setJumpValue] = React.useState(new Date(now).valueOf());
  const apolloClient = useApolloClient();
  const fetch = React.useCallback(
    async (date: G.DateQuery): Promise<ReadonlyArray<G.ResFragment>> => {
      const result = await apolloClient.query<
        G.FindResesQuery,
        G.FindResesQueryVariables
      >({
        query: G.FindResesDocument,
        variables: { query: { topic: match.params.id, date } },
      });
      return result.data.reses;
    },
    [match.params.id],
  );

  React.useEffect(() => {
    (async () => {
      const beforeItems = await fetch({ date: initDate, type: "lte" });
      setItems(beforeItems);
      // TODO: 位置移動
      await sleep(0);
    })();
  }, [match.params.id]);

  const isFavo =
    user.value !== null && Sto.isTopicFavo(match.params.id)(user.value.storage);

  G.useResAddedSubscription({
    variables: { topic: match.params.id },
    onSubscriptionData: ({ subscriptionData: { data } }) => {
      if (data !== undefined) {
        const {
          resAdded: { count, res },
        } = data;
        topics.updateQuery(ts => ({
          ...ts,
          topics: ts.topics.map(t => ({
            ...t,
            resCount: count,
          })),
        }));
        setExistUnread(false);
        setItems(
          pipe(
            items,
            ArrayExtra.mergeAndUniqSortedArray(ordListItemKey)(
              item => getKeyFromRes(item),
              [res],
            ),
          ),
        );
      }
    },
  });

  const useFetch = React.useMemo(() => makeUseFetch(match.params.id), [
    match.params.id,
  ]);

  function storageSaveDate(date: string | null) {
    if (user.value === null || topic === null) {
      return;
    }
    const storage = user.value.storage;
    const odate = pipe(
      [
        O.fromNullable(date),
        pipe(
          storage,
          Sto.getTopicRead(match.params.id),
          O.map(storageRes => Sto.topicReadDateLens.get(storageRes)),
        ),
        pipe(
          itemsRef.current,
          RA.head,
          O.map(first => first.date),
        ),
      ],
      Monoid_.fold(O.getFirstMonoid()),
    );

    if (O.isSome(odate)) {
      user.update({
        ...user.value,
        storage: Sto.setTopicRead(
          topic.id,
          Sto.makeTopicRead({
            date: odate.value,
            count: topic.resCount,
          }),
        )(storage),
      });
    }
  }

  React.useEffect(() => {
    storageSaveDate(null);
  }, [topic !== null ? topic.resCount : null]);

  useTitle(topic !== null ? topic.title : "トピック");

  return (
    <Page
      disableScroll={true}
      sidebar={
        user.value !== null ? (
          <TopicFavo detail={false} userData={user.value} />
        ) : undefined
      }
    >
      {topic !== null ? (
        <>
          <Modal
            isOpen={isAutoScrollDialog}
            onRequestClose={() => setIsAutoScrollDialog(false)}
          >
            <h1>自動スクロール</h1>
            <Toggle
              label="自動スクロール"
              toggled={isAutoScroll}
              onToggle={(_e, v) => setIsAutoScroll(v)}
            />
            <Slider
              max={30}
              value={autoScrollSpeed}
              onChange={(_e, v) => setAutoScrollSpeed(v)}
            />
          </Modal>
          {user.value !== null ? (
            <Modal
              isOpen={isNGDialog}
              onRequestClose={() => setIsNGDialog(false)}
            >
              <h1>NG</h1>
              <NG
                userData={user.value}
                onChangeStorage={v => {
                  if (user.value !== null) {
                    user.update({
                      ...user.value,
                      storage: v,
                    });
                  }
                }}
              />
            </Modal>
          ) : null}
          <Modal
            isOpen={isJumpDialog}
            onRequestClose={() => setIsJumpDialog(false)}
          >
            <h1>ジャンプ</h1>
            <Slider
              min={new Date(topic.date).valueOf()}
              max={new Date(now).valueOf()}
              value={jumpValue}
              onChange={(_e, v) => setJumpValue(v)}
            />
            <div>{moment(new Date(jumpValue)).format("YYYY-MM-DD")}</div>
            <div>
              <RaisedButton
                onClick={() => {
                  scrollNewItem.current.next(new Date(jumpValue).toISOString());
                }}
              >
                ジャンプ
              </RaisedButton>
            </div>
          </Modal>
          <div className={style.main}>
            <Paper className={style.header}>
              <div className={style.subject}>
                {topic.__typename === "TopicFork" ? (
                  <FontIcon className="material-icons">call_split</FontIcon>
                ) : null}
                {topic.__typename === "TopicOne" ? (
                  <FontIcon className="material-icons">looks_one</FontIcon>
                ) : null}
                {topic.title}
              </div>
              <div className={style.toolbar}>
                {user.value !== null ? (
                  <IconButton
                    onClick={() => {
                      if (user.value === null) {
                        return;
                      }
                      const storage = user.value.storage;
                      user.update({
                        ...user.value,
                        storage: (isFavo ? Sto.unfavoTopic : Sto.favoTopic)(
                          match.params.id,
                        )(storage),
                      });
                    }}
                  >
                    <FontIcon className="material-icons">
                      {isFavo ? "star" : "star_border"}
                    </FontIcon>
                  </IconButton>
                ) : null}
                <PopupMenu
                  trigger={
                    <IconButton touch={true}>
                      <FontIcon className="material-icons">more_vert</FontIcon>
                    </IconButton>
                  }
                >
                  <MenuItem
                    primaryText="詳細データ"
                    containerElement={
                      <Link
                        to={routes.topicData.to(
                          {
                            id: match.params.id,
                          },
                          { state: { modal: true } },
                        )}
                      />
                    }
                  />
                  {topic.__typename === "TopicNormal" && user.value !== null ? (
                    <MenuItem
                      primaryText="トピック編集"
                      containerElement={
                        <Link
                          to={routes.topicEdit.to(
                            {
                              id: match.params.id,
                            },
                            { state: { modal: true } },
                          )}
                        />
                      }
                    />
                  ) : null}
                  {topic.__typename === "TopicNormal" ? (
                    <MenuItem
                      primaryText="派生トピック"
                      containerElement={
                        <Link
                          to={routes.topicFork.to(
                            {
                              id: match.params.id,
                            },
                            { state: { modal: true } },
                          )}
                        />
                      }
                    />
                  ) : null}
                  <MenuItem
                    primaryText="自動スクロール"
                    onClick={() => setIsAutoScrollDialog(true)}
                  />
                  <MenuItem
                    primaryText="ジャンプ"
                    onClick={() => setIsJumpDialog(true)}
                  />
                  <MenuItem
                    primaryText="NG"
                    onClick={() => setIsNGDialog(true)}
                  />
                </PopupMenu>
              </div>
            </Paper>
            <InfiniteScroll<G.ResFragment>
              fetchKey={[match.params.id]}
              useStream={useStream}
              useFetch={useFetch}
              className={style.reses}
              newItemOrder="bottom"
              width={10}
              debounceTime={500}
              autoScrollSpeed={autoScrollSpeed}
              isAutoScroll={isAutoScroll}
              scrollNewItemChange={res => storageSaveDate(res.date)}
              scrollNewItem={scrollNewItem.current}
              initDate={initDate}
              dataToEl={res => (
                <Res
                  res={res}
                  update={res => {
                    setItems(items =>
                      items.map(item => (item.id === res.id ? res : item)),
                    );
                  }}
                />
              )}
              items={items}
              changeItems={x => {
                setItems(x);
              }}
              existUnread={existUnread}
              onChangeExistUnread={x => setExistUnread(x)}
            />
            {existUnread ? (
              <div
                style={{
                  boxShadow: "0px 0px 5px 3px rgba(255, 0, 255, 0.7)",
                  zIndex: 2,
                }}
              />
            ) : null}
            {user.value !== null ? (
              <Paper className={style.resWrite}>
                <ResWrite
                  topic={topic.id}
                  reply={null}
                  userData={user.value}
                  changeStorage={x => {
                    if (user.value !== null) {
                      user.update({
                        ...user.value,
                        storage: x,
                      });
                    }
                  }}
                />
              </Paper>
            ) : null}
          </div>
        </>
      ) : null}
    </Page>
  );
};
