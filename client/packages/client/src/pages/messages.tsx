import { Paper, RaisedButton } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Md, Page } from "../components";
import * as G from "../generated/graphql";
import {
  dateFormat,
  queryResultConvert,
  userSwitch,
  UserSwitchProps,
} from "../utils";
import { RA, O } from "../prelude";

type MessagesPageProps = UserSwitchProps;

export const MessagesPage = userSwitch((_props: MessagesPageProps) => {
  const now = React.useRef(new Date().toISOString());
  const msgs = G.useFindMsgsQuery({
    variables: {
      query: {
        date: {
          date: now.current,
          type: "lte",
        },
      },
    },
  });
  queryResultConvert(msgs);

  return (
    <Page>
      <Helmet title="お知らせ" />
      <div>
        <div>
          <RaisedButton
            label="最新"
            onClick={async () => {
              if (msgs.data === undefined) {
                return;
              }
              const first = RA.head(msgs.data.msgs);
              if (O.isNone(first)) {
                await msgs.refetch();
              } else {
                msgs.fetchMore({
                  variables: {
                    query: {
                      date: {
                        date: first.value.date,
                        type: "gt",
                      },
                    },
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) {
                      return prev;
                    }
                    return {
                      ...prev,
                      msgs: [...fetchMoreResult.msgs, ...prev.msgs],
                    };
                  },
                });
              }
            }}
          />
        </div>
        <div>
          {msgs.data !== undefined
            ? msgs.data.msgs.map(m => (
                <Paper key={m.id}>
                  <div>{dateFormat.format(m.date)}</div>
                  <Md text={m.text} />
                </Paper>
              ))
            : null}
        </div>
        <div>
          <RaisedButton
            label="前"
            onClick={async () => {
              if (msgs.data === undefined) {
                return;
              }

              const last = RA.last(msgs.data.msgs);
              if (O.isNone(last)) {
                await msgs.refetch();
              } else {
                msgs.fetchMore({
                  variables: {
                    query: {
                      date: {
                        date: last.value.date,
                        type: "lt",
                      },
                    },
                  },
                  updateQuery: (prev, { fetchMoreResult }) => {
                    if (!fetchMoreResult) {
                      return prev;
                    }
                    return {
                      ...prev,
                      msgs: [...prev.msgs, ...fetchMoreResult.msgs],
                    };
                  },
                });
              }
            }}
          />
        </div>
      </div>
    </Page>
  );
});
