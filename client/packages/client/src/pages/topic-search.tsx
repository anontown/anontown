import { routes } from "@anontown/common/lib/route";
import {
  Checkbox,
  FontIcon,
  IconButton,
  RaisedButton,
  TextField,
} from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import useRouter from "use-react-router";
import { Page, TagsInput, TopicListItem } from "../components";
import * as G from "../generated/graphql";
import { useUserContext } from "../hooks";
import { Card } from "../styled/card";
import { queryResultConvert } from "../utils";
import { Sto } from "../domains/entities";
import { useDebouncedCallback } from "use-debounce";
import { useOnChnageUrlSearch } from "../hooks/use-on-change-url-search";

interface Query {
  title: string;
  tags: ReadonlyArray<string>;
  dead: boolean;
}

interface State {
  query: Query;
  input: Query;
}

type Action =
  | { type: "UPDATE_INPUT_TITLE"; title: string }
  | { type: "UPDATE_INPUT_TAGS"; tags: ReadonlyArray<string> }
  | { type: "UPDATE_INPUT_DEAD"; dead: boolean }
  | { type: "UPDATE_URL_QUERY"; query: Query }
  | { type: "COMPLETE_INPUT" };

export const TopicSearchPage = (_props: {}) => {
  const { history } = useRouter();

  const init = useOnChnageUrlSearch(
    query => routes.topicSearch.parseQuery(query),
    query => {
      dispatch({ type: "UPDATE_URL_QUERY", query: query });
    },
  );

  const [state, dispatch] = React.useReducer(
    (prev: State, action: Action): State => {
      switch (action.type) {
        case "UPDATE_INPUT_TITLE": {
          return {
            ...prev,
            input: {
              ...prev.input,
              title: action.title,
            },
          };
        }
        case "UPDATE_INPUT_TAGS": {
          return {
            ...prev,
            input: {
              ...prev.input,
              tags: action.tags,
            },
          };
        }
        case "UPDATE_INPUT_DEAD": {
          return {
            ...prev,
            input: {
              ...prev.input,
              dead: action.dead,
            },
          };
        }
        case "COMPLETE_INPUT": {
          return {
            ...prev,
            query: prev.input,
          };
        }
        case "UPDATE_URL_QUERY": {
          return {
            ...prev,
            input: action.query,
            query: action.query,
          };
        }
      }
    },
    {
      input: init,
      query: init,
    },
  );

  const [onInput] = useDebouncedCallback(() => {
    dispatch({ type: "COMPLETE_INPUT" });
    history.push(
      routes.topicSearch.to(
        {},
        {
          query: {
            title: state.input.title,
            dead: state.input.dead,
            tags: state.input.tags,
          },
        },
      ),
    );
  }, 500);

  const user = useUserContext();
  const limit = 100;

  const topics = G.useFindTopicsQuery({
    variables: {
      query: {
        title: state.query.title,
        tags: state.query.tags,
        activeOnly: !state.query.dead,
      },
      limit,
    },
  });
  queryResultConvert(topics);

  return (
    <Page>
      <Helmet title="検索" />
      <Card>
        {user.value !== null ? (
          <IconButton
            onClick={() => {
              if (user.value === null) {
                return;
              }
              const storage = user.value.storage;
              user.update({
                ...user.value,
                storage: (Sto.isTagsFavo(state.query.tags)(storage)
                  ? Sto.unfavoTags
                  : Sto.favoTags)(state.query.tags)(storage),
              });
            }}
          >
            {Sto.isTagsFavo(state.query.tags)(user.value.storage) ? (
              <FontIcon className="material-icons">star</FontIcon>
            ) : (
              <FontIcon className="material-icons">star_border</FontIcon>
            )}
          </IconButton>
        ) : null}
        <div>
          <TagsInput
            fullWidth={true}
            value={state.input.tags}
            onChange={v => {
              dispatch({ type: "UPDATE_INPUT_TAGS", tags: v });
              onInput();
            }}
          />
          <TextField
            fullWidth={true}
            floatingLabelText="タイトル"
            value={state.input.title}
            onChange={(_e, v) => {
              dispatch({ type: "UPDATE_INPUT_TITLE", title: v });
              onInput();
            }}
          />
          <Checkbox
            label="過去ログも"
            checked={state.input.dead}
            onCheck={(_e, v) => {
              dispatch({ type: "UPDATE_INPUT_DEAD", dead: v });
              onInput();
            }}
          />
        </div>
      </Card>
      <div>
        {user.value !== null ? (
          <IconButton
            containerElement={<Link to={routes.topicCreate.to({})} />}
          >
            <FontIcon className="material-icons">edit</FontIcon>
          </IconButton>
        ) : null}
        <IconButton onClick={() => topics.refetch()}>
          <FontIcon className="material-icons">refresh</FontIcon>
        </IconButton>
      </div>
      <div>
        {topics.data !== undefined
          ? topics.data.topics.map(t => (
              <TopicListItem key={t.id} topic={t} detail={true} />
            ))
          : null}
      </div>
      <div>
        <RaisedButton
          onClick={() => {
            topics.fetchMore({
              variables: {
                skip: topics.data !== undefined ? topics.data.topics.length : 0,
              },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult) {
                  return prev;
                }
                return {
                  ...prev,
                  msgs: [...prev.topics, ...fetchMoreResult.topics],
                };
              },
            });
          }}
          label="もっと"
        />
      </div>
    </Page>
  );
};
