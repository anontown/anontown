import * as rx from "rxjs";
import * as ops from "rxjs/operators";
import * as G from "../../generated/graphql";
import { pipe, O, RA, Monoid_, isNotNull, RxExtra } from "../../prelude";
import { Sto, UserData } from "../../domains/entities";
import ApolloClient from "apollo-client";
import { Epic } from "../../hooks/use-reducer-with-observable";
import { Observable } from "rxjs";
import { Action } from "./action";
import { State } from "./state";

export interface Env {
  apolloClient: ApolloClient<object>;
  updateUserData: (userData: UserData | null) => void;
}

export function storageSaveDate(
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

export const epic: Epic<Action, State, Env> = (action$, state$, env) =>
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
      ops.filter(([_action, state]) => !state.fetchingOld),
      ops.map(([_action, state]) =>
        pipe(
          O.fromNullable(state.reses),
          O.chain(RA.head),
          O.map(headRes => ({ headRes, topicId: state.topicId })),
          O.toNullable,
        ),
      ),
      ops.filter(isNotNull),
      RxExtra.delayMinMergeMap(({ headRes, topicId }) =>
        fetchNewRes(
          { topicId: topicId, base: new Date(headRes.date) },
          env,
        ).pipe(
          ops.map((action): [number | null, Action] =>
            action.type === "FETCH_NEW_RES_REQUEST"
              ? [null, action]
              : [200, action],
          ),
        ),
      ),
    ),
    action$.pipe(
      ops.map(action => (action.type === "SCROLL_TO_LAST" ? action : null)),
      ops.filter(isNotNull),
      ops.withLatestFrom(state$),
      ops.filter(([_action, state]) => !state.fetchingNew),
      ops.map(([_action, state]) =>
        pipe(
          O.fromNullable(state.reses),
          O.chain(RA.last),
          O.map(lastRes => ({ lastRes, topicId: state.topicId })),
          O.toNullable,
        ),
      ),
      ops.filter(isNotNull),
      RxExtra.delayMinMergeMap(({ lastRes, topicId }) =>
        fetchOldRes({ topicId, base: new Date(lastRes.date) }, env).pipe(
          ops.map((action): [number | null, Action] =>
            action.type === "FETCH_OLD_RES_REQUEST"
              ? [null, action]
              : [200, action],
          ),
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
