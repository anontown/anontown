import { routes } from "@anontown/route";
import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import useRouter from "use-react-router";
import { Page, TopicFork } from "../components";
import * as G from "../generated/graphql";
import {
  queryResultConvert,
  userSwitch,
  UserSwitchProps,
  withModal,
} from "../utils";

type TopicForkBaseProps = UserSwitchProps & {
  zDepth?: number;
};

const TopicForkBase = userSwitch((props: TopicForkBaseProps) => {
  const { match, history } = useRouter<{ id: string }>();
  const topics = G.useFindTopicsQuery({
    variables: {
      query: {
        id: [match.params.id],
      },
    },
  });
  queryResultConvert(topics);
  const topic = topics.data !== undefined ? topics.data.topics[0] : null;

  return (
    <Paper zDepth={props.zDepth}>
      <Helmet title="派生トピック" />
      {topic !== null && topic.__typename === "TopicNormal" ? (
        <TopicFork
          topic={topic}
          onCreate={x => {
            history.push(routes.topic.to({ id: x.id }));
          }}
        />
      ) : null}
    </Paper>
  );
});

export function TopicForkPage() {
  return (
    <Page>
      <TopicForkBase />
    </Page>
  );
}

export const TopicForkModal = withModal(
  () => <TopicForkBase zDepth={0} />,
  "派生トピック",
);
