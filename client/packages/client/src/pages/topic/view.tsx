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
import useRouter from "use-react-router";
import { Modal, NG, Page, Res, ResWrite, TopicFavo } from "../../components";
import { PopupMenu } from "../../components/popup-menu";
import * as G from "../../generated/graphql";
import { useUserContext } from "../../hooks";
import * as style from "./style.scss";
import { RA } from "../../prelude";
import { Sto } from "../../domains/entities";
import { InfiniteScroll } from "../../components/infinite-scroll";
import { useReducerWithObservable } from "../../hooks/use-reducer-with-observable";
import { reducer } from "./reducer";
import { State } from "./state";
import { epic } from "./epic";

// TODO:NGのtransparent

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
