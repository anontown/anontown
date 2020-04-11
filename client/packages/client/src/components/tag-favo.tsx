import { routes } from "@anontown/common/lib/route";
import * as React from "react";
import { Link } from "react-router-dom";
import { UserData } from "../models";
import { Card } from "../styled/card";
import { TextTitle } from "../styled/text";
import { TagsLink } from "./tags-link";

interface TagFavoProps {
  userData: UserData;
}

interface TagFavoState {}

export class TagFavo extends React.Component<TagFavoProps, TagFavoState> {
  constructor(props: TagFavoProps) {
    super(props);
  }

  render() {
    return this.props.userData.storage.tagsFavo.size !== 0 ? (
      this.props.userData.storage.tagsFavo
        .map(tags => (
          <Card key={tags.sort().join(",")}>
            <TextTitle>
              <TagsLink tags={tags.toArray()} />
            </TextTitle>
          </Card>
        ))
        .toArray()
    ) : (
      <Card>
        お気に入りタグがありません。
        <br />
        <Link to={routes.topicSearch.to({})}>検索</Link>
      </Card>
    );
  }
}
