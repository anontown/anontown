import { routes } from "@anontown/route";
import { FontIcon, IconButton, MenuItem, Paper } from "material-ui";
import * as React from "react";
import { Link } from "react-router-dom";
import * as uuid from "uuid";
import * as G from "../generated/graphql";
import { useUserContext } from "../hooks";
import { ng } from "../models";
import {
  Card,
  CardContent,
  CardFlex,
  CardFlexFixed,
  CardFlexStretch,
  CardHeader,
} from "../styled/card";
import { color, fontSize } from "../styled/constant";
import { dateFormat } from "../utils";
import { Icon } from "./icon";
import { Md } from "./md";
import { PopupMenu } from "./popup-menu";
import { ResWrite } from "./res-write";
import { Snack } from "./snack";

interface ResProps {
  res: G.ResFragment;
  update?: (res: G.ResFragment) => void;
}

export const Res = (props: ResProps) => {
  const [isReply, setIsReply] = React.useState(false);
  const [snackMsg, setSnackMsg] = React.useState<string | null>(null);
  const [disableNG, setDisableNG] = React.useState(false);
  const user = useUserContext();

  const smallIcon = {
    width: 18,
    height: 18,
  };
  const small = {
    width: 36,
    height: 36,
    padding: 8,
  };

  return user.value !== null &&
    !props.res.self &&
    !disableNG &&
    user.value.storage.ng.some(x => ng.isNG(x, props.res)) ? (
    <Card>
      あぼーん<a onClick={() => setDisableNG(true)}>[見る]</a>
    </Card>
  ) : (
    <Card padding="none">
      <Snack msg={snackMsg} onHide={() => setSnackMsg(null)} />
      <CardFlex>
        <CardFlexFixed
          width={48}
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <G.VoteResComponent
            variables={{
              res: props.res.id,
              type: props.res.voteFlag === "uv" ? "cv" : "uv",
            }}
            onCompleted={data => {
              if (props.update) {
                props.update(data.voteRes);
              }
            }}
          >
            {(submit, { error }) => {
              return (
                <>
                  {error && <Snack msg="投票に失敗しました" />}
                  <IconButton
                    onClick={() => submit()}
                    disabled={props.res.self || user.value === null}
                  >
                    <FontIcon
                      className="material-icons"
                      color={props.res.voteFlag === "uv" ? "orange" : undefined}
                    >
                      keyboard_arrow_up
                    </FontIcon>
                  </IconButton>
                </>
              );
            }}
          </G.VoteResComponent>
          <G.VoteResComponent
            variables={{
              res: props.res.id,
              type: props.res.voteFlag === "dv" ? "cv" : "dv",
            }}
            onCompleted={data => {
              if (props.update) {
                props.update(data.voteRes);
              }
            }}
          >
            {(submit, { error }) => {
              return (
                <>
                  {error && <Snack msg="投票に失敗しました" />}
                  <IconButton
                    onClick={() => submit()}
                    disabled={props.res.self || user.value === null}
                  >
                    <FontIcon
                      className="material-icons"
                      color={props.res.voteFlag === "dv" ? "orange" : undefined}
                    >
                      keyboard_arrow_down
                    </FontIcon>
                  </IconButton>
                </>
              );
            }}
          </G.VoteResComponent>
        </CardFlexFixed>
        <CardFlexStretch>
          <CardHeader
            style={{
              backgroundColor: props.res.self
                ? color.primary
                : props.res.__typename === "ResNormal" && props.res.isReply
                ? color.secondary
                : undefined,
              fontSize: fontSize.sub,
            }}
          >
            <a onClick={() => setIsReply(!isReply)}>{">>"}</a>
            &nbsp;
            {props.res.__typename === "ResNormal" && props.res.name !== null ? (
              <span>{props.res.name}</span>
            ) : null}
            {props.res.__typename === "ResNormal" &&
            props.res.name === null &&
            props.res.profile === null ? (
              <span>名無しさん</span>
            ) : null}
            {props.res.__typename === "ResHistory" ? (
              <span>トピックデータ</span>
            ) : null}
            {(props.res.__typename as any) === "ResTopic" ? (
              <span>トピ主</span>
            ) : null}
            {props.res.__typename === "ResFork" ? (
              <span>派生トピック</span>
            ) : null}
            {props.res.__typename === "ResDelete" ? <span>削除</span> : null}
            {props.res.__typename === "ResNormal" &&
            props.res.profile !== null ? (
              <Link
                to={routes.profile.to(
                  { id: props.res.profile.id },
                  {
                    state: {
                      modal: true,
                    },
                  },
                )}
              >
                @{props.res.profile.sn}
              </Link>
            ) : null}
            &nbsp;
            <Link
              to={routes.res.to(
                { id: props.res.id, topic: props.res.topic.id },
                { state: { modal: true } },
              )}
            >
              {dateFormat.format(props.res.date)}
            </Link>
            &nbsp;
            <Link
              to={routes.hash.to(
                { hash: props.res.hash, topic: props.res.topic.id },
                {
                  state: {
                    modal: true,
                  },
                },
              )}
            >
              #{props.res.hash.substr(0, 6)}
            </Link>
            &nbsp;
            <span>{props.res.uv - props.res.dv}vote</span>
            {user.value !== null ? (
              <PopupMenu
                trigger={
                  <IconButton
                    style={{ width: "32px", height: "32px", padding: "0px" }}
                  >
                    <Icon
                      icon="keyboard_arrow_down"
                      style={{ fontSize: "10px" }}
                    />
                  </IconButton>
                }
              >
                {props.res.self && props.res.__typename === "ResNormal" ? (
                  <G.DelResComponent
                    variables={{ res: props.res.id }}
                    onCompleted={data => {
                      if (props.update) {
                        props.update(data.delRes);
                      }
                    }}
                  >
                    {(submit, { error }) => {
                      return (
                        <>
                          {error && <Snack msg={"削除に失敗しました"} />}
                          <MenuItem
                            primaryText="削除"
                            onClick={() => submit()}
                          />
                        </>
                      );
                    }}
                  </G.DelResComponent>
                ) : null}
                <MenuItem
                  primaryText="NG HASH"
                  onClick={() => {
                    if (user.value !== null) {
                      user.update({
                        ...user.value,
                        storage: {
                          ...user.value.storage,
                          ng: user.value.storage.ng.insert(0, {
                            id: uuid.v4(),
                            name: `HASH:${props.res.hash}`,
                            topic: props.res.topic.id,
                            date: new Date(),
                            expirationDate: null,
                            chain: 1,
                            transparent: false,
                            node: {
                              type: "hash",
                              id: uuid.v4(),
                              hash: props.res.hash,
                            },
                          }),
                        },
                      });
                    }
                  }}
                />
                {props.res.__typename === "ResNormal" &&
                props.res.profile !== null ? (
                  <MenuItem
                    primaryText="NG Profile"
                    onClick={() => {
                      if (
                        user.value !== null &&
                        props.res.__typename === "ResNormal" &&
                        props.res.profile !== null
                      ) {
                        user.update({
                          ...user.value,
                          storage: {
                            ...user.value.storage,
                            ng: user.value.storage.ng.insert(0, {
                              id: uuid.v4(),
                              name: `Profile:${props.res.profile.id}`,
                              topic: null,
                              date: new Date(),
                              expirationDate: null,
                              chain: 1,
                              transparent: false,
                              node: {
                                type: "profile",
                                id: uuid.v4(),
                                profile: props.res.profile.id,
                              },
                            }),
                          },
                        });
                      }
                    }}
                  />
                ) : null}
              </PopupMenu>
            ) : null}
          </CardHeader>
          <CardContent>
            <span>
              {props.res.__typename === "ResNormal" &&
              props.res.reply !== null ? (
                <IconButton
                  containerElement={
                    <Link
                      to={routes.res.to(
                        { id: props.res.reply.id, topic: props.res.topic.id },
                        { state: { modal: true } },
                      )}
                    />
                  }
                  style={small}
                  iconStyle={smallIcon}
                >
                  <FontIcon className="material-icons">send</FontIcon>
                </IconButton>
              ) : null}
              {props.res.replyCount !== 0 ? (
                <span>
                  <IconButton
                    containerElement={
                      <Link
                        to={routes.resReply.to(
                          { id: props.res.id, topic: props.res.topic.id },
                          { state: { modal: true } },
                        )}
                      />
                    }
                    style={small}
                    iconStyle={smallIcon}
                  >
                    <FontIcon className="material-icons">reply</FontIcon>
                  </IconButton>
                  {props.res.replyCount}
                </span>
              ) : null}
            </span>
            {props.res.__typename === "ResNormal" ? (
              <Md text={props.res.text} />
            ) : props.res.__typename === "ResHistory" ? (
              <Md text={props.res.history.text} />
            ) : (props.res.__typename as any) === "ResTopic" &&
              props.res.topic.__typename === "TopicOne" ? (
              <Md text={props.res.topic.text} />
            ) : null}
            {props.res.__typename === ("ResTopic" as any) &&
            props.res.topic.__typename === "TopicFork" ? (
              <div>
                <p>派生トピックが建ちました。</p>
              </div>
            ) : null}
            {props.res.__typename === "ResFork" ? (
              <div>
                <p>
                  派生トピック:
                  <Link to={routes.topic.to({ id: props.res.fork.id })}>
                    {props.res.fork.title}
                  </Link>
                </p>
              </div>
            ) : null}

            {props.res.__typename === "ResDelete" ? (
              <div>
                <p>
                  {props.res.flag === "self"
                    ? "投稿者により削除されました。"
                    : "管理人により削除されました。"}
                </p>
              </div>
            ) : null}
            {isReply && user.value !== null ? (
              <Paper>
                <ResWrite
                  topic={props.res.topic.id}
                  reply={props.res.id}
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
          </CardContent>
        </CardFlexStretch>
      </CardFlex>
    </Card>
  );
};
