import { routes } from "@anontown/common/lib/route";
import { Paper, RaisedButton, TextField } from "material-ui";
import * as React from "react";
import Recaptcha from "react-google-recaptcha";
import { Helmet } from "react-helmet";
import { Link, Redirect } from "react-router-dom";
import { Errors, Page } from "../components";
import { Env } from "../env";
import * as G from "../generated/graphql";
import { UserContext } from "../hooks";
import { createUserData } from "../utils";

interface SignupPageState {
  sn: string;
  pass: string;
  errors?: Array<string>;
  recaptcha: string | null;
}

export const SignupPage = class extends React.Component<{}, SignupPageState> {
  recaptchaRef = React.createRef<any>();

  constructor(props: {}) {
    super(props);
    this.state = {
      sn: "",
      pass: "",
      recaptcha: null,
    };
  }

  render() {
    return (
      <Page>
        <Helmet title="登録" />
        <UserContext.Consumer>
          {user =>
            user.value !== null ? (
              <Redirect to={routes.home.to({})} />
            ) : (
              <Paper>
                <form>
                  <Errors errors={this.state.errors} />
                  <div>
                    <TextField
                      floatingLabelText="ID"
                      value={this.state.sn}
                      onChange={(_e, v) => this.setState({ sn: v })}
                    />
                  </div>
                  <div>
                    <TextField
                      floatingLabelText="パスワード"
                      value={this.state.pass}
                      onChange={(_e, v) => this.setState({ pass: v })}
                      type="password"
                    />
                  </div>
                  <Recaptcha
                    sitekey={Env.recaptcha.siteKey}
                    ref={this.recaptchaRef}
                    onChange={(v: string) => this.setState({ recaptcha: v })}
                  />
                  <div>
                    <a
                      target="_blank"
                      href="https://document.anontown.com/terms.html"
                    >
                      利用規約(10行くらいしかないから読んでね)
                    </a>
                  </div>

                  <G.CreateUserComponent
                    onError={() => {
                      const rc = this.recaptchaRef.current;
                      if (rc) {
                        rc.reset();
                      }
                      this.setState({
                        errors: ["アカウント作成に失敗しました"],
                      });
                    }}
                    onCompleted={async x => {
                      user.update(
                        await createUserData(
                          x.createUser.token as G.TokenMasterFragment,
                        ),
                      );
                    }}
                    variables={{
                      sn: this.state.sn,
                      pass: this.state.pass,
                      recaptcha: this.state.recaptcha!,
                    }}
                  >
                    {create => (
                      <div>
                        <RaisedButton
                          label="利用規約に同意して登録"
                          onClick={() => create()}
                        />
                      </div>
                    )}
                  </G.CreateUserComponent>
                  <Link to={routes.login.to({})}>ログイン</Link>
                </form>
              </Paper>
            )
          }
        </UserContext.Consumer>
      </Page>
    );
  }
};
