import { routes } from "@anontown/common/lib/route";
import * as React from "react";
import { Link } from "react-router-dom";
import * as G from "../generated/graphql";
import { useUserContext } from "../hooks";
import { Card } from "../styled/card";
import { TextTitle } from "../styled/text";
import { dateFormat } from "../utils";
import { Icon } from "./icon";
import { TagsLink } from "./tags-link";
import { Sto } from "../domains/entities";
import { O, pipe } from "../prelude";

interface TopicListItemProps {
  topic: G.TopicFragment;
  detail: boolean;
}

export const TopicListItem = (props: TopicListItemProps) => {
  const user = useUserContext();

  const newRes = pipe(
    O.fromNullable(user.value),
    O.chain(userData => Sto.getTopicRead(props.topic.id)(userData.storage)),
    O.map(topicData =>
      Math.max(0, props.topic.resCount - Sto.topicReadCountLens.get(topicData)),
    ),
    O.toNullable,
  );

  return (
    <Card>
      <TextTitle>
        {!props.topic.active ? <Icon icon="not_interested" /> : null}
        {props.topic.__typename === "TopicOne" ? (
          <Icon icon="looks_one" />
        ) : null}
        {props.topic.__typename === "TopicFork" ? (
          <Icon icon="call_split" />
        ) : null}
        {newRes !== null && newRes !== 0 ? <Icon icon="fiber_new" /> : null}
        <Link to={routes.topic.to({ id: props.topic.id })}>
          {props.topic.title}
        </Link>
      </TextTitle>
      {props.detail ? (
        <>
          {props.topic.__typename === "TopicOne" ||
          props.topic.__typename === "TopicNormal" ? (
            <div>
              <TagsLink tags={props.topic.tags} mini={true} />
            </div>
          ) : null}
          {props.topic.__typename === "TopicFork" ? (
            <Link
              to={routes.topic.to({
                id: props.topic.parent.id,
              })}
            >
              親トピック
            </Link>
          ) : null}

          <div>
            作成 {dateFormat.format(props.topic.date)} 更新{" "}
            {dateFormat.format(props.topic.update)}
          </div>
          <div>
            総レス数 {props.topic.resCount}{" "}
            {newRes !== null && newRes !== 0 ? (
              <span>新着 {newRes}</span>
            ) : null}
          </div>
        </>
      ) : null}
    </Card>
  );
};
