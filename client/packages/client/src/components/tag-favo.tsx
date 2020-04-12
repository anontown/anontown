import { routes } from "@anontown/common/lib/route";
import * as React from "react";
import { Link } from "react-router-dom";
import { UserData, Sto } from "../domains/entities";
import { Card } from "../styled/card";
import { TextTitle } from "../styled/text";
import { TagsLink } from "./tags-link";
import { RA } from "../prelude";

interface TagFavoProps {
  userData: UserData;
}

interface TagFavoState {}

export class TagFavo extends React.Component<TagFavoProps, TagFavoState> {
  constructor(props: TagFavoProps) {
    super(props);
  }

  render() {
    const tagsFavo = Sto.getTagsFavo(this.props.userData.storage);
    return tagsFavo.length !== 0 ? (
      tagsFavo.map(tags => {
        // TODO: readonlyのまま扱う
        const sortedTags = RA.toArray(tags).sort();
        return (
          <Card key={sortedTags.join(",")}>
            <TextTitle>
              <TagsLink tags={sortedTags} />
            </TextTitle>
          </Card>
        );
      })
    ) : (
      <Card>
        お気に入りタグがありません。
        <br />
        <Link to={routes.topicSearch.to({})}>検索</Link>
      </Card>
    );
  }
}
