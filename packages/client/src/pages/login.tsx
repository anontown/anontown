import {
  Paper,
  RaisedButton,
  TextField,
} from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import {
  Link,
  Redirect,
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
import * as G from "../../generated/graphql";
import {
  Errors,
  Page,
} from "../components";
import { createUserData, useUserContext } from "../utils";

type LoginPageProps = RouteComponentProps<{}>;

export const LoginPage = withRouter((_props: LoginPageProps) => {
  const [sn, setSn] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [errors, setErrors] = React.useState<string[] | undefined>(undefined);
  const userContext = useUserContext();
  const submit = G.useCreateTokenMasterMutation();

  return (
    <Page>
      <Helmet title="ログイン" />
      {userContext.value !== null
        ? <Redirect to="/" />
        : <Paper>
          <Errors errors={errors} />
          <form>
            <div>
              <TextField
                floatingLabelText="ID"
                value={sn}
                onChange={(_e, v) => setSn(v)}
              />
            </div>
            <div>
              <TextField
                floatingLabelText="パスワード"
                value={pass}
                onChange={(_e, v) => setPass(v)}
                type="password"
              />
            </div>
            <div><RaisedButton
              label="ログイン"
              onClick={async () => {
                try {
                  const token = await submit({
                    variables: {
                      auth: {
                        sn, pass,
                      },
                    },
                  });
                  if (token.data !== undefined) {
                    userContext.update(await createUserData(token.data.createTokenMaster as G.TokenMasterFragment));
                  }
                } catch {
                  setErrors(["ログインに失敗しました。"]);
                }
              }}
            /></div>
            <Link to="/signup">登録</Link>
          </form>
        </Paper>}
    </Page>
  );

});
