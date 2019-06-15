import { FontIcon } from "material-ui";
import * as React from "react";
import { Link } from "react-router-dom";
import * as G from "../../generated/graphql";
import { dateFormat, useUserContext } from "../utils";
import { TagsLink } from "./tags-link";
import * as style from "./topic-list-item.scss";

interface TopicListItemProps {
  topic: G.TopicFragment;
  detail: boolean;
}

export const TopicListItem = (props: TopicListItemProps) => {
  const user = useUserContext();

  let newRes: number | null = null;
  if (user.value !== null) {
    const topicData = user.value.storage.topicRead.get(props.topic.id);
    if (topicData !== undefined) {
      newRes = Math.max(0, props.topic.resCount - topicData.count);
    }
  }

  return (
    <div className={style.container}>
      <div>
        {!props.topic.active ? <FontIcon className="material-icons">not_interested</FontIcon> : null}
        {props.topic.__typename === "TopicOne" ? <FontIcon className="material-icons">looks_one</FontIcon> : null}
        {props.topic.__typename === "TopicFork" ? <FontIcon className="material-icons">call_split</FontIcon> : null}
        {newRes !== null && newRes !== 0 ? <FontIcon className="material-icons">fiber_new</FontIcon> : null}
        <Link className={style.title} to={`/topic/${props.topic.id}`}>{props.topic.title}</Link>
      </div >
      {props.detail
        ? <div>
          {props.topic.__typename === "TopicOne" || props.topic.__typename === "TopicNormal"
            ? <div>
              <TagsLink tags={props.topic.tags} mini={true} />
            </div >
            : null}
          {props.topic.__typename === "TopicFork"
            ? <Link to={`/topic/${props.topic.parent}`}>親トピック</Link>
            : null}

          <div>
            作成 {dateFormat.format(props.topic.date)} 更新 {dateFormat.format(props.topic.update)}
          </div>
          <div>
            総レス数 {props.topic.resCount} {newRes !== null && newRes !== 0 ? <span>新着 {newRes}</span> : null}
          </div>
        </div >
        : null
      }
    </div>
  );
};
