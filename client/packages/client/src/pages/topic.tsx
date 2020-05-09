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
import { Modal, NG, Page, Res, ResWrite, TopicFavo } from "../components";
import { PopupMenu } from "../components/popup-menu";
import * as G from "../generated/graphql";
import { useUserContext } from "../hooks";
import * as style from "./topic.scss";
import {
  pipe,
  O,
  RA,
  Monoid_,
  ArrayExtra,
  Ord,
  OrdT,
  isNotNull,
  RxExtra,
} from "../prelude";
import { Sto, UserData } from "../domains/entities";
import { InfiniteScroll } from "../components/infinite-scroll";
import ApolloClient from "apollo-client";
import {
  Epic,
  useReducerWithObservable,
} from "../hooks/use-reducer-with-observable";
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

interface State {
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
    jumpResId: null,
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
  | { type: "CHANGE_AUTO_SCROLL_SPEED"; value: number }
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
  | { type: "RECEIVE_NEW_RES"; res: G.ResFragment; count: number }
  | { type: "UPDATE_RES"; res: G.ResFragment }
  | { type: "RESET_JUMP_RES" };

interface Env {
  apolloClient: ApolloClient<object>;
  updateUserData: (userData: UserData | null) => void;
}

function storageSaveDate(
  { count, date }: { count?: number; date?: string },
  state: State,
  env: Env,
): rx.Observable<Action> {
  return RxExtra.fromIOVoid(() => {
    if (
      state.userData === null ||
      state.topic === null ||
      state.reses === null
    ) {
      return;
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
  });
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
      return prevState;
    }
    case "FETCH_NEW_RES_SUCCESS": {
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], action.reses),
      };
    }
    case "FETCH_NEW_RES_FAILURE": {
      return prevState;
    }
    case "SCROLL_TO_LAST": {
      return prevState;
    }
    case "FETCH_OLD_RES_REQUEST": {
      return prevState;
    }
    case "FETCH_OLD_RES_SUCCESS": {
      return {
        ...prevState,
        reses: mergeReses(prevState.reses ?? [], action.reses),
      };
    }
    case "FETCH_OLD_RES_FAILURE": {
      return prevState;
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

function fetchTopic(
  { topicId }: { topicId: string },
  env: Env,
): Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_TOPIC_REQUEST" }),
    RxExtra.fromTask(() =>
      env.apolloClient.query<G.FindTopicsQuery, G.FindTopicsQueryVariables>({
        query: G.FindTopicsDocument,
        variables: { query: { id: [topicId] } },
      }),
    ).pipe(
      ops.mergeMap(res =>
        pipe(
          RA.head(res.data.topics),
          O.map(topic => rx.of<Action>({ type: "FETCH_TOPIC_SUCCESS", topic })),
          O.getOrElse<rx.Observable<Action>>(() => rx.throwError(new Error())),
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
  return RxExtra.fromTask(() =>
    env.apolloClient.query<G.FindResesQuery, G.FindResesQueryVariables>({
      query: G.FindResesDocument,
      variables: {
        query: {
          topic: topicId,
          date: dateQuery,
        },
      },
    }),
  ).pipe(ops.map(res => res.data.reses));
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
          RxExtra.fromZen(
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
            ops.map(
              (res): Action => ({
                type: "RECEIVE_NEW_RES",
                res: res.resAdded.res,
                count: res.resAdded.count,
              }),
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
      ops.map(action =>
        action.type === "FETCH_TOPIC_SUCCESS" ? action : null,
      ),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(([action, state]) => {
        return storageSaveDate({ count: action.topic.resCount }, state, env);
      }),
    ),
    action$.pipe(
      ops.map(action => (action.type === "RECEIVE_NEW_RES" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(([action, state]) => {
        return storageSaveDate({ count: action.count }, state, env);
      }),
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
          return RxExtra.fromIOVoid(() => {
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
          });
        },
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "SUBMIT_RES" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.mergeMap(
        ([action, state]): Observable<Action> => {
          return RxExtra.fromIOVoid(() => {
            if (state.userData !== null) {
              env.updateUserData({
                ...state.userData,
                storage: action.storage,
              });
            }
          });
        },
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "CHANGE_CURRENT_RES" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.debounceTime(500),
      ops.mergeMap(
        ([action, state]): Observable<Action> => {
          if (action.res) {
            return storageSaveDate({ date: action.res.date }, state, env);
          } else {
            return rx.never();
          }
        },
      ),
    ),
  );

export const TopicPage = (_props: {}) => {
  const { match } = useRouter<{ id: string }>();
  const user = useUserContext();
  const apolloClient = useApolloClient();

  const [state, dispatch] = useReducerWithObservable(
    reducer,
    State({ userData: user.value, topicId: match.params.id }),
    epic,
    { apolloClient: apolloClient, updateUserData: ud => user.update(ud) },
  );

  React.useEffect(() => {
    dispatch({ type: "UPDATE_USER_DATA", userData: user.value });
  }, [user.value]);

  React.useEffect(() => {
    dispatch({ type: "INIT", topicId: match.params.id, now: new Date() });
  }, [match.params.id]);

  const isFavo =
    state.userData !== null &&
    Sto.isTopicFavo(state.topicId)(state.userData.storage);

  useTitle(state.topic?.title ?? "トピック");

  const reversedReses = React.useMemo(
    () => (state.reses !== null ? RA.reverse(state.reses) : null),
    [state.reses],
  );

  const handleUpdateRes = React.useCallback((res: G.ResFragment) => {
    dispatch({ type: "UPDATE_RES", res });
  }, []);

  return (
    <Page
      disableScroll={true}
      sidebar={
        state.userData !== null ? (
          <TopicFavo detail={false} userData={state.userData} />
        ) : undefined
      }
    >
      {state.topic !== null &&
      reversedReses !== null &&
      state.now !== null &&
      state.jumpValue !== null ? (
        <>
          <Modal
            isOpen={state.isAutoScrollDialog}
            onRequestClose={() =>
              dispatch({ type: "CLICK_CLOSE_AUTO_SCROLL_MODAL" })
            }
          >
            <h1>自動スクロール</h1>
            <Toggle
              label="自動スクロール"
              toggled={state.isAutoScroll}
              onToggle={(_e, v) =>
                dispatch({ type: "CHANGE_ENABLE_AUTO_SCROLL", value: v })
              }
            />
            <Slider
              max={30}
              value={state.autoScrollSpeed}
              onChange={(_e, v) =>
                dispatch({ type: "CHANGE_AUTO_SCROLL_SPEED", value: v })
              }
            />
          </Modal>
          {state.userData !== null ? (
            <Modal
              isOpen={state.isNGDialog}
              onRequestClose={() => dispatch({ type: "CLICK_CLOSE_NG_MODAL" })}
            >
              <h1>NG</h1>
              <NG
                userData={state.userData}
                onChangeStorage={v => {
                  dispatch({ type: "UPDATE_NG", storage: v });
                }}
              />
            </Modal>
          ) : null}
          <Modal
            isOpen={state.isJumpDialog}
            onRequestClose={() => dispatch({ type: "CLICK_CLOSE_JUMP_MODAL" })}
          >
            <h1>ジャンプ</h1>
            <Slider
              min={new Date(state.topic.date).valueOf()}
              max={state.now.valueOf()}
              value={state.jumpValue}
              onChange={(_e, v) =>
                dispatch({ type: "CHANGE_JUMP_VALUE", value: v })
              }
            />
            <div>{moment(new Date(state.jumpValue)).format("YYYY-MM-DD")}</div>
            <div>
              <RaisedButton
                onClick={() => {
                  dispatch({ type: "CLICK_JUMP" });
                }}
              >
                ジャンプ
              </RaisedButton>
            </div>
          </Modal>
          <div className={style.main}>
            <Paper className={style.header}>
              <div className={style.subject}>
                {state.topic.__typename === "TopicFork" ? (
                  <FontIcon className="material-icons">call_split</FontIcon>
                ) : null}
                {state.topic.__typename === "TopicOne" ? (
                  <FontIcon className="material-icons">looks_one</FontIcon>
                ) : null}
                {state.topic.title}
              </div>
              <div className={style.toolbar}>
                {state.userData !== null ? (
                  <IconButton
                    onClick={() => {
                      dispatch({ type: "TOGGLE_FAVO" });
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
                            id: state.topicId,
                          },
                          { state: { modal: true } },
                        )}
                      />
                    }
                  />
                  {state.topic.__typename === "TopicNormal" &&
                  state.userData !== null ? (
                    <MenuItem
                      primaryText="トピック編集"
                      containerElement={
                        <Link
                          to={routes.topicEdit.to(
                            {
                              id: state.topicId,
                            },
                            { state: { modal: true } },
                          )}
                        />
                      }
                    />
                  ) : null}
                  {state.topic.__typename === "TopicNormal" ? (
                    <MenuItem
                      primaryText="派生トピック"
                      containerElement={
                        <Link
                          to={routes.topicFork.to(
                            {
                              id: state.topicId,
                            },
                            { state: { modal: true } },
                          )}
                        />
                      }
                    />
                  ) : null}
                  <MenuItem
                    primaryText="自動スクロール"
                    onClick={() =>
                      dispatch({ type: "CLICK_OPEN_AUTO_SCROLL_MODAL" })
                    }
                  />
                  <MenuItem
                    primaryText="ジャンプ"
                    onClick={() => dispatch({ type: "CLICK_OPEN_JUMP_MODAL" })}
                  />
                  <MenuItem
                    primaryText="NG"
                    onClick={() => dispatch({ type: "CLICK_OPEN_NG_MODAL" })}
                  />
                </PopupMenu>
              </div>
            </Paper>
            <InfiniteScroll<G.ResFragment>
              itemToKey={res => res.id}
              renderItem={res => <Res res={res} update={handleUpdateRes} />}
              className={style.reses}
              items={reversedReses}
              jumpItemKey={state.jumpResId}
              onResetJumpItemKey={() => {
                dispatch({ type: "RESET_JUMP_RES" });
              }}
              onChangeCurrentItem={res =>
                dispatch({ type: "CHANGE_CURRENT_RES", res })
              }
              onScrollTop={() => dispatch({ type: "SCROLL_TO_LAST" })}
              onScrollBottom={() => dispatch({ type: "SCROLL_TO_FIRST" })}
              currentItemBase="bottom"
              autoScroll={
                state.isAutoScroll
                  ? { interval: 100, speed: state.autoScrollSpeed }
                  : undefined
              }
            />
            {state.existUnread ? (
              <div
                style={{
                  boxShadow: "0px 0px 5px 3px rgba(255, 0, 255, 0.7)",
                  zIndex: 2,
                }}
              />
            ) : null}
            {state.userData !== null ? (
              <Paper className={style.resWrite}>
                <ResWrite
                  topic={state.topic.id}
                  reply={null}
                  userData={state.userData}
                  changeStorage={storage => {
                    dispatch({ type: "SUBMIT_RES", storage });
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
