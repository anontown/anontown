import { routes } from "@anontown/common/lib/route";
import { RaisedButton } from "material-ui";
import * as React from "react";
import { useTitle } from "react-use";
import useRouter from "use-react-router";
import { Errors, Page, Snack } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";

type AuthPageProps = UserSwitchProps;

export const AuthPage = userSwitch((_props: AuthPageProps) => {
  const { location } = useRouter();
  const [snackMsg, setSnackMsg] = React.useState<string | null>(null);
  const query = routes.auth.parseQuery(location.search);
  const clients = G.useFindClientsQuery({
    skip: query.id === undefined,
    variables: { query: { id: query.id !== undefined ? [query.id] : [] } },
  });
  queryResultConvert(clients);
  const [submit] = G.useCreateTokenGeneralMutation();

  useTitle("アプリ認証");

  return (
    <Page>
      <Snack msg={snackMsg} onHide={() => setSnackMsg(null)} />
      {clients.loading ? <div>loading</div> : null}
      {query.id === undefined ? <div>パラメーターが不正です</div> : null}
      {clients.error !== undefined ? (
        <Errors errors={["クライアント取得に失敗しました。"]} />
      ) : null}
      {clients.data !== undefined ? (
        <div>
          認証しますか？
          <RaisedButton
            type="button"
            label="OK"
            onClick={async () => {
              if (clients.data !== undefined) {
                const client = clients.data.clients[0];
                try {
                  const data = await submit({
                    variables: { client: client.id },
                  });
                  if (data.data !== undefined) {
                    window.location.href =
                      client.url +
                      "?" +
                      "id=" +
                      data.data.createTokenGeneral.req.token +
                      "&key=" +
                      encodeURI(data.data.createTokenGeneral.req.key);
                  }
                } catch {
                  setSnackMsg("エラーが発生しました");
                }
              }
            }}
          />
        </div>
      ) : null}
    </Page>
  );
});
