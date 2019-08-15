import { routes } from "@anontown/route";
import * as React from "react";
import { Link } from "react-router-dom";
import * as G from "../generated/graphql";
import { dateFormat } from "../utils";
import { Md } from "./md";
import { TagsLink } from "./tags-link";

export interface TopicDataProps {
  topic: G.TopicFragment;
}

export function TopicData(props: TopicDataProps) {
  return (
    <div>
      <dl>
        <dt>作成</dt>
        <dd>{dateFormat.format(props.topic.date)}</dd>
        <dt>更新</dt>
        <dd>{dateFormat.format(props.topic.update)}</dd>
        {props.topic.__typename === "TopicNormal" ||
        props.topic.__typename === "TopicOne" ? (
          <>
            <dt>カテゴリ</dt>
            <dd>
              <TagsLink tags={props.topic.tags} />
            </dd>
            <dt>本文</dt>
            <dd>
              <Md text={props.topic.text} />
            </dd>
          </>
        ) : null}
        {props.topic.__typename === "TopicFork" ? (
          <>
            <dt>派生元</dt>
            <dd>
              <Link to={routes.topic.to({ id: props.topic.parent.id })}>
                {props.topic.parent.title}
              </Link>
            </dd>
          </>
        ) : null}
        {
          // TODO: 編集履歴を別ページにしてここからリンク
        }
      </dl>
    </div>
  );
}
