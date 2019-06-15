import * as React from "react";
import { Link } from "react-router-dom";
import * as G from "../../generated/graphql";
import { dateFormat } from "../utils";
import { Md } from "./md";
import { TagsLink } from "./tags-link";

export interface TopicDataProps {
  topic: G.TopicFragment;
}

interface TopicDataState {
}

export class TopicData extends React.Component<TopicDataProps, TopicDataState> {
  constructor(props: TopicDataProps) {
    super(props);
    this.state = {
    };
  }
  render() {
    return (
      <div>
        <dl>
          <dt>作成</dt>
          <dd>{dateFormat.format(this.props.topic.date)}</dd>
          <dt>更新</dt>
          <dd>{dateFormat.format(this.props.topic.update)}</dd>
          {this.props.topic.__typename === "TopicNormal" || this.props.topic.__typename === "TopicOne"
            ? <>
              <dt>カテゴリ</dt>
              <dd>
                <TagsLink tags={this.props.topic.tags} />
              </dd>
              <dt>本文</dt>
              <dd>
                <Md text={this.props.topic.text} />
              </dd>
            </>
            : null
          }
          {this.props.topic.__typename === "TopicFork"
            ? <>
              <dt>派生元</dt>
              <dd>
                <Link to={`/topic/${this.props.topic.parent.id}`}>{this.props.topic.parent.title}</Link>
              </dd>
            </>
            : null}
          {
            // TODO: 編集履歴を別ページにしてここからリンク
          }
        </dl>
      </div>
    );
  }
}
