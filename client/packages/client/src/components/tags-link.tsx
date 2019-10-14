import { routes } from "@anontown/route";
import * as React from "react";
import { Link } from "react-router-dom";
import * as style from "./tags-link.scss";

export interface TagsLinkProps {
  tags: string[];
  mini?: boolean;
}

export function TagsLink(props: TagsLinkProps) {
  return (
    <Link
      className={props.mini ? style.mini : undefined}
      to={routes.topicSearch.to(
        {},
        {
          query: {
            tags: props.tags,
          },
        },
      )}
    >
      {props.tags.length !== 0 ? props.tags.join(",") : "(なし)"}
    </Link>
  );
}
