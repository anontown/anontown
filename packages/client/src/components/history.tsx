import {
  FontIcon,
  IconButton,
} from "material-ui";
import * as React from "react";
import { Link } from "react-router-dom";
import * as G from "../../generated/graphql";
import {
  dateFormat,
} from "../utils";
import { Md } from "./md";
import { TagsLink } from "./tags-link";

interface HistoryProps {
  history: G.HistoryFragment;
}

interface HistoryState {
  detail: boolean;
}

export class History extends React.Component<HistoryProps, HistoryState> {
  constructor(props: HistoryProps) {
    super(props);

    this.state = {
      detail: false,
    };
  }

  render() {
    return (
      <div>
        <div>
          <IconButton onClick={() => this.setState({ detail: !this.state.detail })}>
            {this.state.detail
              ? <FontIcon className="material-icons">arrow_drop_up</FontIcon>
              : <FontIcon className="material-icons">arrow_drop_down</FontIcon>}
          </IconButton>
          {dateFormat.format(this.props.history.date)}
          <Link
            to={{
              pathname: `/hash/${encodeURIComponent(this.props.history.hash)}`,
              state: {
                modal: true,
              },
            }}
          >
            HASH:{this.props.history.hash.substr(0, 6)}
          </Link>
        </div>
        {this.state.detail ?
          <dl>
            <dt>タイトル</dt>
            <dd>{this.props.history.title}</dd>
            <dt>カテゴリ</dt>
            <dd><TagsLink tags={this.props.history.tags} /></dd >
            <dt>本文</dt>
            <dd>
              <Md text={this.props.history.text} />
            </dd >
          </dl > : null
        }
      </div>
    );
  }
}
