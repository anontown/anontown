import { rx, rxOps } from "../../prelude";
import * as G from "../../generated/graphql";
import { pipe, O, RA, Monoid_, isNotNull, RxExtra } from "../../prelude";
import { Sto, UserData } from "../../domains/entities";
import ApolloClient from "apollo-client";
import { Epic } from "../../hooks/use-reducer-with-observable";
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
): rx.Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_TOPIC_REQUEST" }),
    RxExtra.fromTask(() =>
      env.apolloClient.query<G.FindTopicsQuery, G.FindTopicsQueryVariables>({
        query: G.FindTopicsDocument,
        variables: { query: { id: [topicId] } },
      }),
    ).pipe(
      rxOps.mergeMap(res =>
        pipe(
          RA.head(res.data.topics),
          O.map(topic => rx.of<Action>({ type: "FETCH_TOPIC_SUCCESS", topic })),
          O.getOrElse<rx.Observable<Action>>(() => rx.throwError(new Error())),
        ),
      ),
      rxOps.catchError(_e => rx.of<Action>({ type: "FETCH_TOPIC_FAILURE" })),
    ),
  );
}

function fetchRes(
  { topicId, dateQuery }: { topicId: string; dateQuery: G.DateQuery },
  env: Env,
): rx.Observable<ReadonlyArray<G.ResFragment>> {
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
  ).pipe(rxOps.map(res => res.data.reses));
}

function fetchInitRes(
  { topicId, base }: { topicId: string; base: Date },
  env: Env,
): rx.Observable<Action> {
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
        rxOps.map(
          ([before, after]): Action => ({
            type: "FETCH_INIT_RES_SUCCESS",
            beforeReses: before,
            afterReses: after,
          }),
        ),
        rxOps.catchError(_e =>
          rx.of<Action>({ type: "FETCH_INIT_RES_FAILURE" }),
        ),
      ),
  );
}

function fetchNewRes(
  { topicId, base }: { topicId: string; base: Date },
  env: Env,
): rx.Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_NEW_RES_REQUEST" }),
    fetchRes(
      { topicId, dateQuery: { type: "gt", date: base.toISOString() } },
      env,
    ).pipe(
      rxOps.map(
        (reses): Action => ({
          type: "FETCH_NEW_RES_SUCCESS",
          reses,
        }),
      ),
      rxOps.catchError(_e => rx.of<Action>({ type: "FETCH_NEW_RES_FAILURE" })),
    ),
  );
}

function fetchOldRes(
  { topicId, base }: { topicId: string; base: Date },
  env: Env,
): rx.Observable<Action> {
  return rx.merge(
    rx.of<Action>({ type: "FETCH_OLD_RES_REQUEST" }),
    fetchRes(
      { topicId, dateQuery: { type: "lt", date: base.toISOString() } },
      env,
    ).pipe(
      rxOps.map(
        (reses): Action => ({
          type: "FETCH_OLD_RES_SUCCESS",
          reses,
        }),
      ),
      rxOps.catchError(_e => rx.of<Action>({ type: "FETCH_OLD_RES_FAILURE" })),
    ),
  );
}

export const epic: Epic<Action, State, Env> = (action$, state$, env) =>
  rx.merge(
    action$.pipe(
      rxOps.map(action => (action.type === "INIT" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.mergeMap(([action, state]) =>
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
            rxOps.map(res => res.data ?? null),
            rxOps.filter(isNotNull),
            rxOps.map(
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
      rxOps.map(action =>
        action.type === "FETCH_TOPIC_SUCCESS" ? action : null,
      ),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.mergeMap(([action, state]) => {
        return storageSaveDate({ count: action.topic.resCount }, state, env);
      }),
    ),
    action$.pipe(
      rxOps.map(action => (action.type === "RECEIVE_NEW_RES" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.mergeMap(([action, state]) => {
        return storageSaveDate({ count: action.count }, state, env);
      }),
    ),
    action$.pipe(
      rxOps.map(action => (action.type === "SCROLL_TO_FIRST" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.filter(([_action, state]) => !state.fetchingOld),
      rxOps.map(([_action, state]) =>
        pipe(
          O.fromNullable(state.reses),
          O.chain(RA.head),
          O.map(headRes => ({ headRes, topicId: state.topicId })),
          O.toNullable,
        ),
      ),
      rxOps.filter(isNotNull),
      RxExtra.delayMinMergeMap(({ headRes, topicId }) =>
        fetchNewRes(
          { topicId: topicId, base: new Date(headRes.date) },
          env,
        ).pipe(
          rxOps.map((action): [number | null, Action] =>
            action.type === "FETCH_NEW_RES_REQUEST"
              ? [null, action]
              : [200, action],
          ),
        ),
      ),
    ),
    action$.pipe(
      rxOps.map(action => (action.type === "SCROLL_TO_LAST" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.filter(([_action, state]) => !state.fetchingNew),
      rxOps.map(([_action, state]) =>
        pipe(
          O.fromNullable(state.reses),
          O.chain(RA.last),
          O.map(lastRes => ({ lastRes, topicId: state.topicId })),
          O.toNullable,
        ),
      ),
      rxOps.filter(isNotNull),
      RxExtra.delayMinMergeMap(({ lastRes, topicId }) =>
        fetchOldRes({ topicId, base: new Date(lastRes.date) }, env).pipe(
          rxOps.map((action): [number | null, Action] =>
            action.type === "FETCH_OLD_RES_REQUEST"
              ? [null, action]
              : [200, action],
          ),
        ),
      ),
    ),
    action$.pipe(
      rxOps.map(action => (action.type === "UPDATE_NG" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.mergeMap(
        ([action, state]): rx.Observable<Action> => {
          if (state.userData !== null) {
            env.updateUserData({ ...state.userData, storage: action.storage });
          }
          return rx.never();
        },
      ),
    ),
    action$.pipe(
      rxOps.map(action => (action.type === "CLICK_JUMP" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.map(([_action, state]) =>
        state.jumpValue !== null
          ? { topicId: state.topicId, jumpValue: state.jumpValue }
          : null,
      ),
      rxOps.filter(isNotNull),
      rxOps.mergeMap(({ topicId, jumpValue }) =>
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
      rxOps.map(action => (action.type === "TOGGLE_FAVO" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.mergeMap(
        ([_action, state]): rx.Observable<Action> => {
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
      rxOps.map(action => (action.type === "SUBMIT_RES" ? action : null)),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.mergeMap(
        ([action, state]): rx.Observable<Action> => {
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
      rxOps.map(action =>
        action.type === "CHANGE_CURRENT_RES" ? action : null,
      ),
      rxOps.filter(isNotNull),
      rxOps.withLatestFrom(state$),
      rxOps.debounceTime(500),
      rxOps.mergeMap(
        ([action, state]): rx.Observable<Action> => {
          if (action.res) {
            return storageSaveDate({ date: action.res.date }, state, env);
          } else {
            return rx.never();
          }
        },
      ),
    ),
  );
