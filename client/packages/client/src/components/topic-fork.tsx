import { RaisedButton, TextField } from "material-ui";
import * as React from "react";
import * as G from "../generated/graphql";
import { useUserContext } from "../hooks";
import { Errors } from "./errors";
import { Snack } from "./snack";
import { TopicListItem } from "./topic-list-item";

interface TopicForkProps {
  topic: G.TopicNormalFragment;
  onCreate?: (topic: G.TopicForkFragment) => void;
}

export const TopicFork = (props: TopicForkProps) => {
  const [title, setTitle] = React.useState("");
  const user = useUserContext();

  return (
    <div>
      {user.value !== null ? (
        <G.CreateTopicForkComponent
          variables={{
            title,
            parent: props.topic.id,
          }}
          onCompleted={data => {
            props.onCreate?.(data.createTopicFork);
          }}
        >
          {(submit, { error }) => {
            return (
              <form>
                {error && <Errors errors={["作成に失敗"]} />}
                <TextField
                  floatingLabelText="タイトル"
                  value={title}
                  onChange={(_e, v) => setTitle(v)}
                />
                <RaisedButton onClick={() => submit()} label="新規作成" />
              </form>
            );
          }}
        </G.CreateTopicForkComponent>
      ) : null}
      <hr />
      <G.FindTopicsComponent variables={{ query: { parent: props.topic.id } }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <span>Loading...</span>;
          }
          if (error || !data) {
            return <Snack msg="派生トピック取得に失敗しました" />;
          }
          return (
            <div>
              {data.topics.map(t => (
                <TopicListItem key={t.id} topic={t} detail={false} />
              ))}
            </div>
          );
        }}
      </G.FindTopicsComponent>
    </div>
  );
};
