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
import * as rx from "rxjs";
import * as op from "rxjs/operators";
import useRouter from "use-react-router";
import { Page, TagsInput, TopicListItem } from "../components";
import * as G from "../generated/graphql";
import { useEffectRef, useUserContext } from "../hooks";
import { Card } from "../styled/card";
import { queryResultConvert } from "../utils";
import { Sto } from "../domains/entities";

export const TopicSearchPage = (_props: {}) => {
  const { location, history } = useRouter();
  const query = routes.topicSearch.parseQuery(location.search);
  const formChange = React.useRef(new rx.Subject<void>());
  const [formTitle, setFormTitle] = React.useState(query.title);
  const [formDead, setFormDead] = React.useState(query.dead);
  const [formTags, setFormTags] = React.useState<ReadonlyArray<string>>(
    query.tags,
  );
  React.useEffect(() => {
    setFormTitle(query.title);
    setFormDead(query.dead);
    setFormTags(query.tags);
  }, [location.search]);
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
      history.push(
        routes.topicSearch.to(
          {},
          {
            query: {
              title: formTitle,
              dead: formDead,
              tags: formTags,
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
                storage: (Sto.isTagsFavo(query.tags)(storage)
                  ? Sto.unfavoTags
                  : Sto.favoTags)(query.tags)(storage),
              });
            }}
          >
            {Sto.isTagsFavo(query.tags)(user.value.storage) ? (
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
