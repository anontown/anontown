import {
  Paper,
  RaisedButton,
  TextField,
} from "material-ui";
import * as React from "react";
import Recaptcha from "react-google-recaptcha";
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
import { Config } from "../env";
import { createUserData, UserContext } from "../utils";

interface SignupPageProps extends RouteComponentProps<{}> {
}

interface SignupPageState {
  sn: string;
  pass: string;
  errors?: string[];
  recaptcha: string | null;
}

export const SignupPage = withRouter(class extends React.Component<SignupPageProps, SignupPageState> {
  recaptchaRef = React.createRef<any>();

  constructor(props: SignupPageProps) {
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
        <UserContext.Consumer>{user => user.value !== null
          ? <Redirect to="/" />
          : <Paper>
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
                sitekey={Config.recaptcha.siteKey}
                ref={this.recaptchaRef}
                onChange={(v: string) => this.setState({ recaptcha: v })}
              />
              <div><a target="_blank" href="https://document.anontown.com/terms.html">利用規約(10行くらいしかないから読んでね)</a></div>

              <G.CreateUserComponent
                onError={() => {
                  const rc = this.recaptchaRef.current;
                  if (rc) {
                    rc.reset();
                  }
                  this.setState({ errors: ["アカウント作成に失敗しました"] });
                }}
                onCompleted={async x => {
                  user.update(await createUserData(x.createUser.token as G.TokenMasterFragment));
                }}
                variables={{
                  sn: this.state.sn, pass: this.state.pass,
                  recaptcha: this.state.recaptcha!,
                }}
              >
                {create =>
                  (<div><RaisedButton label="利用規約に同意して登録" onClick={() => create()} /></div>)}
              </G.CreateUserComponent>
              <Link to="/login">ログイン</Link>
            </form>
          </Paper>}</UserContext.Consumer>
      </Page>
    );
  }
});
