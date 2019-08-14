import { routes } from "@anontown/route";
import * as Im from "immutable";
import {
  Checkbox,
  FontIcon,
  IconButton,
  Paper,
  RaisedButton,
  TextField,
} from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { withRouter } from "react-router";
import { Link, RouteComponentProps } from "react-router-dom";
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import { Page, TagsInput, TopicListItem } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, useEffectRef, useUserContext } from "../utils";
import * as style from "./topic-search.scss";
import { Card } from "../styled/card";

type TopicSearchPageProps = RouteComponentProps<{}>;

export const TopicSearchPage = withRouter((props: TopicSearchPageProps) => {
  const query = routes.topicSearch.parseQuery(props.location.search);
  const formChange = React.useRef(new rx.Subject<void>());
  const [formTitle, setFormTitle] = React.useState(query.title);
  const [formDead, setFormDead] = React.useState(query.dead);
  const [formTags, setFormTags] = React.useState(Im.Set(query.tags));
  React.useEffect(() => {
    setFormTitle(query.title);
    setFormDead(query.dead);
    setFormTags(Im.Set(query.tags));
  }, [props.location.search]);
  const user = useUserContext();
  const limit = 100;

  const topics = G.useFindTopicsQuery({
    variables: {
      query: {
        title: query.title,
        tags: query.tags,
        activeOnly: !query.dead,
      },
      limit,
    },
  });
  queryResultConvert(topics);

  useEffectRef(
    f => {
      const sub = formChange.current
        .pipe(op.debounceTime(500))
        .subscribe(() => {
          f.current();
        });
      return () => {
        sub.unsubscribe();
      };
    },
    () => {
      props.history.push(
        routes.topicSearch.to(
          {},
          {
            query: {
              title: formTitle,
              dead: formDead,
              tags: formTags.toArray(),
            },
          },
        ),
      );
    },
    [formChange.current],
  );

  return (
    <Page>
      <Helmet title="検索" />
      <Paper className={style.form}>
        {user.value !== null ? (
          <IconButton
            onClick={() => {
              if (user.value === null) {
                return;
              }
              const storage = user.value.storage;
              const tf = storage.tagsFavo;
              const tags = Im.Set(query.tags);
              user.update({
                ...user.value,
                storage: {
                  ...storage,
                  tagsFavo: tf.has(tags) ? tf.delete(tags) : tf.add(tags),
                },
              });
            }}
          >
            {user.value.storage.tagsFavo.has(Im.Set(query.tags)) ? (
              <FontIcon className="material-icons">star</FontIcon>
            ) : (
              <FontIcon className="material-icons">star_border</FontIcon>
            )}
          </IconButton>
        ) : null}
        <div>
          <TagsInput
            fullWidth={true}
            value={formTags}
            onChange={v => {
              setFormTags(v);
              formChange.current.next();
            }}
          />
          <TextField
            fullWidth={true}
            floatingLabelText="タイトル"
            value={formTitle}
            onChange={(_e, v) => {
              setFormTitle(v);
              formChange.current.next();
            }}
          />
          <Checkbox
            label="過去ログも"
            checked={formDead}
            onCheck={(_e, v) => {
              setFormDead(v);
              formChange.current.next();
            }}
          />
        </div>
      </Paper>
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
              <Card key={t.id} padding="none">
                <TopicListItem topic={t} detail={true} />
              </Card>
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
});
