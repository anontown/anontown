import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps } from "react-router-dom";
import { ClientAdd, ClientEditor, Errors, Page } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";
import { isNullish } from "@kgtkr/utils";

type DevSettingPageProps = RouteComponentProps<{}> & UserSwitchProps;

export const DevSettingPage = userSwitch((props: DevSettingPageProps) => {
  const variables: G.FindClientsQueryVariables = { query: { self: true } };
  const clients = G.useFindClientsQuery({ variables });
  queryResultConvert(clients);

  return (
    <Page>
      <Paper>
        <Helmet title="開発者向け" />
        <Paper>クライアント管理</Paper>
        <ClientAdd
          onAddUpdate={(cache, data) => {
            const cs = cache.readQuery<
              G.FindClientsQuery,
              G.FindClientsQueryVariables
            >({
              query: G.FindClientsDocument,
              variables,
            });
            if (cs !== null && !isNullish(data.data)) {
              cache.writeQuery<G.FindClientsQuery, G.FindClientsQueryVariables>(
                {
                  query: G.FindClientsDocument,
                  variables,
                  data: {
                    __typename: "Query",
                    clients: cs.clients.concat([data.data.createClient]),
                  },
                },
              );
            }
          }}
          userData={props.userData}
        />
        {clients.error !== undefined ? (
          <Errors errors={["クライアント取得に失敗しました。"]} />
        ) : null}
        {clients.loading ? <div>loading</div> : null}
        {clients.data !== undefined ? (
          <>
            {clients.data.clients.length === 0 ? (
              <Paper>クライアントがありません</Paper>
            ) : null}
            {clients.data.clients.map(c => (
              <ClientEditor key={c.id} client={c} userData={props.userData} />
            ))}
          </>
        ) : null}
      </Paper>
    </Page>
  );
});
