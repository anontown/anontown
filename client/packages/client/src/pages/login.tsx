import { routes } from "@anontown/route";
import { Paper, RaisedButton, TextField } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Link, Redirect } from "react-router-dom";
import { Errors, Page } from "../components";
import * as G from "../generated/graphql";
import { useUserContext } from "../hooks";
import { createUserData } from "../utils";

interface LoginPageProps {}

export const LoginPage = (_props: LoginPageProps) => {
  const [sn, setSn] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [errors, setErrors] = React.useState<string[] | undefined>(undefined);
  const userContext = useUserContext();
  const [submit] = G.useCreateTokenMasterMutation();

  return (
    <Page>
      <Helmet title="ログイン" />
      {userContext.value !== null ? (
        <Redirect to={routes.home.to({})} />
      ) : (
        <Paper>
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
            <div>
              <RaisedButton
                label="ログイン"
                onClick={async () => {
                  try {
                    const token = await submit({
                      variables: {
                        auth: {
                          sn,
                          pass,
                        },
                      },
                    });
                    if (token.data !== undefined) {
                      userContext.update(
                        await createUserData(token.data
                          .createTokenMaster as G.TokenMasterFragment),
                      );
                    }
                  } catch {
                    setErrors(["ログインに失敗しました。"]);
                  }
                }}
              />
            </div>
            <Link to={routes.signup.to({})}>登録</Link>
          </form>
        </Paper>
      )}
    </Page>
  );
};
