import { arrayFirst } from "@kgtkr/utils";
import {
  FontIcon,
  IconButton,
  IconMenu,
  MenuItem,
  Paper,
  RaisedButton,
  Slider,
  Toggle,
} from "material-ui";
import * as moment from "moment";
import * as React from "react";
import {
  Link,
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
import { useTitle } from "react-use";
import * as rx from "rxjs";
import * as G from "../../generated/graphql";
import {
  Modal,
  NG,
  Page,
  Res,
  ResWrite,
  Scroll,
  TopicFavo,
} from "../components";
import { queryResultConvert, useUserContext } from "../utils";
import * as style from "./topic.scss";
// TODO:NGのtransparent

interface TopicPageProps extends RouteComponentProps<{ id: string }> {

}

export const TopicPage = withRouter((props: TopicPageProps) => {
  const now = React.useMemo(() => new Date().toISOString(), []);
  const [isResWrite, setIsResWrite] = React.useState(false);
  const [isJumpDialog, setIsJumpDialog] = React.useState(false);
  const [isAutoScrollDialog, setIsAutoScrollDialog] = React.useState(false);
  const [isNGDialog, setIsNGDialog] = React.useState(false);
  const user = useUserContext();
  const topics = G.useFindTopicsQuery({ variables: { query: { id: [props.match.params.id] } } });
  queryResultConvert(topics);
  const topic = topics.data !== undefined ? topics.data.topics[0] : null;
  const [autoScrollSpeed, setAutoScrollSpeed] = React.useState(15);
  const [isAutoScroll, setIsAutoScroll] = React.useState(false);
  const scrollNewItem = React.useRef(new rx.ReplaySubject<string>(1));
  const items = React.useRef<G.ResFragment[]>([]);
  const initDate = React.useMemo(() => {
    if (user.value !== null) {
      const topicRead = user.value.storage.topicRead.get(props.match.params.id);
      if (topicRead !== undefined) {
        return topicRead.date;
      } else {
        return now;
      }
    } else {
      return now;
    }
  }, []);
  const [jumpValue, setJumpValue] = React.useState(new Date(now).valueOf());

  const isFavo = user.value !== null && user.value.storage.topicFavo.has(props.match.params.id);

  function storageSaveDate(date: string | null) {
    if (user.value === null || topic === null) {
      return;
    }
    const storage = user.value.storage;
    if (date === null) {
      const storageRes = storage.topicRead.get(props.match.params.id);
      if (storageRes !== undefined) {
        date = storageRes.date;
      } else {
        const first = arrayFirst(items.current);
        if (first === undefined) {
          return;
        }
        date = first.date;
      }
    }
    const dateNonNull = date;
    user.update({
      ...user.value,
      storage: {
        ...storage,
        topicRead: storage.topicRead.update(topic.id, x => ({
          ...x,
          date: dateNonNull,
          count: topic.resCount,
        })),
      },
    });
  }

  React.useEffect(() => {
    storageSaveDate(null);
  }, [topic !== null ? topic.resCount : null]);

  useTitle(topic !== null ? topic.title : "トピック");

  return (
    <Page
      disableScroll={true}
      sidebar={user.value !== null
        ? <TopicFavo detail={false} userData={user.value} />
        : undefined}
    >
      {topic !== null
        ? <>
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
          {user.value !== null ?
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
            : null
          }
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
            <div>
              {moment(new Date(jumpValue)).format("YYYY-MM-DD")}
            </div>
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
                {topic.__typename === "TopicFork"
                  ? <FontIcon className="material-icons">call_split</FontIcon>
                  : null}
                {topic.__typename === "TopicOne"
                  ? <FontIcon className="material-icons">looks_one</FontIcon>
                  : null}
                {topic.title}
              </div>
              <div className={style.toolbar}>
                {user.value !== null
                  ? <IconButton
                    onClick={() => {
                      if (user.value === null) {
                        return;
                      }
                      const storage = user.value.storage;
                      const tf = storage.topicFavo;
                      user.update({
                        ...user.value,
                        storage: {
                          ...storage,
                          topicFavo: isFavo ? tf.delete(props.match.params.id) : tf.add(props.match.params.id),
                        },
                      });
                    }}
                  >
                    {isFavo
                      ? <FontIcon className="material-icons">star</FontIcon>
                      : <FontIcon className="material-icons">star_border</FontIcon>}
                  </IconButton>
                  : null}
                {user.value !== null && topic.active
                  ? <IconButton onClick={() => setIsResWrite(!isResWrite)}>
                    <FontIcon className="material-icons">create</FontIcon>
                  </IconButton>
                  : null}
                <IconMenu
                  iconButtonElement={
                    <IconButton touch={true}>
                      <FontIcon className="material-icons">more_vert</FontIcon>
                    </IconButton>}
                >
                  <MenuItem
                    primaryText="詳細データ"
                    containerElement={<Link
                      to={{
                        pathname: `/topic/${props.match.params.id}/data`,
                        state: { modal: true },
                      }}
                    />}
                  />
                  {topic.__typename === "TopicNormal" && user.value !== null
                    ? <MenuItem
                      primaryText="トピック編集"
                      containerElement={<Link
                        to={{
                          pathname: `/topic/${props.match.params.id}/edit`,
                          state: { modal: true },
                        }}
                      />}
                    />
                    : null}
                  {topic.__typename === "TopicNormal"
                    ? <MenuItem
                      primaryText="派生トピック"
                      containerElement={<Link
                        to={{
                          pathname: `/topic/${props.match.params.id}/fork`,
                          state: { modal: true },
                        }}
                      />}
                    />
                    : null}
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
                </IconMenu>
              </div>
            </Paper>
            <Scroll<G.ResFragment,
              G.FindResesQuery,
              G.FindResesQueryVariables,
              G.ResAddedSubscription,
              G.ResAddedSubscriptionVariables>
              query={G.FindResesDocument}
              queryVariables={date => ({ query: { date, topic: topic.id } })}
              queryResultConverter={x => x.reses}
              queryResultMapper={(x, f) => ({ ...x, reses: f(x.reses) })}
              subscription={G.ResAddedDocument}
              subscriptionVariables={{ topic: topic.id }}
              subscriptionResultConverter={x => x.resAdded.res}
              className={style.reses}
              newItemOrder="bottom"
              width={10}
              debounceTime={500}
              autoScrollSpeed={autoScrollSpeed}
              isAutoScroll={isAutoScroll}
              scrollNewItemChange={res => storageSaveDate(res.date)}
              scrollNewItem={scrollNewItem.current}
              initDate={initDate}
              onSubscription={x => {
                topics.updateQuery(ts => ({
                  ...ts,
                  topics: ts.topics.map(t => ({ ...t, resCount: x.resAdded.count })),
                }));
              }}
              dataToEl={res =>
                <Paper>
                  <Res
                    res={res}
                  />
                </Paper>}
              changeItems={x => {
                items.current = x;
              }}
            />
            {isResWrite && user.value !== null
              ? <Paper className={style.resWrite}>
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
              : null}
          </div>
        </>
        : null
      }
    </Page>
  );
});
