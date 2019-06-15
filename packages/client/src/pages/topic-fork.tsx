import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import {
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
import * as G from "../../generated/graphql";
import {
  Page,
  TopicFork,
} from "../components";
import {
  queryResultConvert, userSwitch, UserSwitchProps, withModal,
} from "../utils";

type TopicForkBaseProps = RouteComponentProps<{ id: string }> & UserSwitchProps & {
  zDepth?: number;
};

const TopicForkBase = withRouter(userSwitch((props: TopicForkBaseProps) => {
  const topics = G.useFindTopicsQuery({
    variables: {
      query: {
        id: [props.match.params.id],
      },
    },
  });
  queryResultConvert(topics);
  const topic = topics.data !== undefined ? topics.data.topics[0] : null;

  return (
    <Paper zDepth={props.zDepth}>
      <Helmet title="派生トピック" />
      {topic !== null && topic.__typename === "TopicNormal"
        ? <TopicFork
          topic={topic}
          onCreate={x => {
            props.history.push(`/topic/${x.id}`);
          }}
        />
        : null}
    </Paper>
  );
}));

export function TopicForkPage() {
  return <Page><TopicForkBase /></Page>;
}

export const TopicForkModal = withModal(() => <TopicForkBase zDepth={0} />, "派生トピック");
