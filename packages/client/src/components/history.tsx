import { routes } from "@anontown/route";
import { FontIcon, IconButton } from "material-ui";
import * as React from "react";
import { Link } from "react-router-dom";
import { useToggle } from "react-use";
import * as G from "../generated/graphql";
import { dateFormat } from "../utils";
import { Md } from "./md";
import { TagsLink } from "./tags-link";

interface HistoryProps {
  history: G.HistoryFragment;
}

export function History(props: HistoryProps) {
  const [detail, toggleDetail] = useToggle(false);

  return (
    <div>
      <div>
        <IconButton onClick={() => toggleDetail()}>
          {detail ? (
            <FontIcon className="material-icons">arrow_drop_up</FontIcon>
          ) : (
            <FontIcon className="material-icons">arrow_drop_down</FontIcon>
          )}
        </IconButton>
        {dateFormat.format(props.history.date)}
        <Link
          to={routes.hash.to(
            {
              hash: props.history.hash,
              topic: props.history.topic.id,
            },
            {
              state: {
                modal: true,
              },
            },
          )}
        >
          HASH:{props.history.hash.substr(0, 6)}
        </Link>
      </div>
      {detail ? (
        <dl>
          <dt>タイトル</dt>
          <dd>{props.history.title}</dd>
          <dt>カテゴリ</dt>
          <dd>
            <TagsLink tags={props.history.tags} />
          </dd>
          <dt>本文</dt>
          <dd>
            <Md text={props.history.text} />
          </dd>
        </dl>
      ) : null}
    </div>
  );
}
