import { RaisedButton } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { Page, Res } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";
import { RA, O } from "../prelude";

type NotificationsPageProps = RouteComponentProps<{}> & UserSwitchProps;

export const NotificationsPage = userSwitch(
  (_props: NotificationsPageProps) => {
    const now = React.useRef(new Date().toISOString());
    const reses = G.useFindResesQuery({
      variables: {
        query: {
          date: {
            date: now.current,
            type: "lte",
          },
          notice: true,
        },
      },
    });
    queryResultConvert(reses);

    return (
      <Page>
        <Helmet title="通知" />
        <div>
          <div>
            <RaisedButton
              label="最新"
              onClick={async () => {
                if (reses.data === undefined) {
                  return;
                }
                const first = RA.last(reses.data.reses);
                if (O.isNone(first)) {
                  await reses.refetch();
                } else {
                  reses.fetchMore({
                    variables: {
                      query: {
                        date: {
                          date: first.value.date,
                          type: "gt",
                        },
                        notice: true,
                      },
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) {
                        return prev;
                      }
                      return {
                        ...prev,
                        msgs: [...fetchMoreResult.reses, ...prev.reses],
                      };
                    },
                  });
                }
              }}
            />
          </div>
          <div>
            {reses.data !== undefined
              ? reses.data.reses.map(r => <Res res={r} key={r.id} />)
              : null}
          </div>
          <div>
            <RaisedButton
              label="前"
              onClick={async () => {
                if (reses.data === undefined) {
                  return;
                }
                const last = RA.last(reses.data.reses);
                if (O.isNone(last)) {
                  await reses.refetch();
                } else {
                  reses.fetchMore({
                    variables: {
                      query: {
                        date: {
                          date: last.value.date,
                          type: "lt",
                        },
                        notice: true,
                      },
                    },
                    updateQuery: (prev, { fetchMoreResult }) => {
                      if (!fetchMoreResult) {
                        return prev;
                      }
                      return {
                        ...prev,
                        reses: [...prev.reses, ...fetchMoreResult.reses],
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
  },
);
