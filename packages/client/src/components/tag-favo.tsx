import {
  Paper,
} from "material-ui";
import * as React from "react";
import { Link } from "react-router-dom";
import { UserData } from "../models";
import * as style from "./tag-favo.scss";
import { TagsLink } from "./tags-link";

interface TagFavoProps {
  userData: UserData;
}

interface TagFavoState {
}

export class TagFavo extends React.Component<TagFavoProps, TagFavoState> {
  constructor(props: TagFavoProps) {
    super(props);
  }

  render() {
    return (
      <Paper className={style.container}>
        {this.props.userData.storage.tagsFavo.size !== 0 ?
          this.props.userData.storage.tagsFavo.map(tags =>
            <div key={tags.join(",")}>
              <TagsLink tags={tags.toArray()} />
            </div>).toArray()
          : <div>
            お気に入りタグがありません。
              <br />
            <Link to="/topic/search">検索</Link>
          </div>}
      </Paper>
    );
  }
}
