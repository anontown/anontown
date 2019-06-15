import * as t from "io-ts";
import {
  FontIcon,
  IconButton,
  IconMenu,
  MenuItem,
  Toolbar,
  ToolbarGroup,
  ToolbarTitle,
} from "material-ui";
import {
  getMuiTheme,
  lightBaseTheme,
  MuiThemeProvider,
} from "material-ui/styles";
import * as React from "react";
import {
  Link,
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from "react-router-dom";
import { UserData } from "src/models";
import * as G from "../../generated/graphql";
import { BUILD_DATE, gaID } from "../env";
import * as pages from "../pages";
import {
  createHeaders,
  createUserData,
  dateFormat,
  gqlClient,
  User,
  UserContextType,
  getServerStatus
} from "../utils";
import * as style from "./app.scss";
import { TwitterTimelineEmbed } from 'react-twitter-embed';

declare const gtag: any;

const muiTheme = getMuiTheme(lightBaseTheme);

interface AppProps extends RouteComponentProps<{}> {
}

interface AppState {
  initUserData?: UserData | null;
  serverStatus: boolean
}

export const App = withRouter(class extends React.Component<AppProps, AppState> {
  previousLocation = this.props.location;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      serverStatus: true
    };
    this.changeLocation(this.props);
    getServerStatus().then(x => {
      this.setState({ serverStatus: x });
    })
  }

  componentDidUpdate(prevProps: AppProps) {
    if (this.props.location !== prevProps.location) {
      this.changeLocation(this.props);
    }
  }

  changeLocation(prop: AppProps) {
    const path = prop.location.pathname;
    gtag("config", gaID, {
      page_path: path,
    });
  }

  async componentWillMount() {
    try {
      const tokenStr = localStorage.getItem("token");
      let token;
      if (tokenStr !== null) {
        const tokenType = t.strict({
          id: t.string,
          key: t.string,
        });
        token = JSON.parse(tokenStr) as unknown;
        if (!tokenType.is(token)) {
          throw Error();
        }
      } else {
        throw Error();
      }
      const res = await gqlClient.query<G.FindTokenQuery>({
        query: G.FindTokenDocument,
        context: {
          headers: createHeaders(token.id, token.key),
        },
      });
      if (res.data.token.__typename as string === "TokenGeneral") {
        throw Error();
      }
      this.setState({ initUserData: await createUserData(res.data.token as G.TokenMasterFragment) });
    } catch {
      this.setState({ initUserData: null });
    }
  }

  componentWillUpdate(nextProps: AppProps) {
    const { location } = this.props;
    if (
      nextProps.history.action !== "POP" &&
      (!location.state || !location.state.modal)
    ) {
      this.previousLocation = this.props.location;
    }
  }

  logout(user: UserContextType) {
    user.update(null);
  }

  render() {
    const { location } = this.props;
    const isModal = !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    );

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this.state.serverStatus
          ? (this.state.initUserData !== undefined
            ? <User initUserData={this.state.initUserData}>
              {user => {
                return <div className={style.container}>
                  <Toolbar className={style.header}>
                    <ToolbarGroup firstChild={true} className={style.big}>
                      {(() => {
                        const now = new Date();
                        if (now.getMonth() + 1 === 4 && now.getDate() === 1 && now.getHours() < 12) {
                          return <ToolbarGroup className={style.april}>April Fool！</ToolbarGroup>;
                        } else {
                          return <ToolbarTitle text="Anontown" />;
                        }
                      })()}
                      <ToolbarTitle
                        text={`build:${dateFormat.format(BUILD_DATE)}`}
                        style={{ fontSize: "0.5rem" }}
                      />
                    </ToolbarGroup>
                    <ToolbarGroup>
                      <IconButton containerElement={<Link to="/" />}>
                        <FontIcon className="material-icons">home</FontIcon>
                      </IconButton>
                      <IconButton containerElement={<Link to="/topic/search" />}>
                        <FontIcon className="material-icons">search</FontIcon>
                      </IconButton>
                      {user.value !== null
                        ? <IconButton containerElement={<Link to="/notifications" />}>
                          <FontIcon className="material-icons">notifications</FontIcon>
                        </IconButton>
                        : null}
                      <IconMenu
                        iconButtonElement={
                          <IconButton touch={true}>
                            <FontIcon className="material-icons">people</FontIcon>
                          </IconButton>}
                      >
                        {user.value !== null
                          ? [
                            <MenuItem
                              key="1"
                              primaryText="プロフ管理"
                              containerElement={<Link to="/profiles" />}
                            />,
                            <MenuItem
                              key="2"
                              primaryText="お知らせ"
                              containerElement={<Link to="/messages" />}
                            />,
                            <MenuItem
                              key="3"
                              primaryText="設定"
                              containerElement={<Link to="/settings/account" />}
                            />,
                            <MenuItem
                              key="4"
                              primaryText="ログアウト"
                              onClick={() => this.logout(user)}
                            />,
                          ]
                          : <MenuItem
                            primaryText="ログイン"
                            containerElement={<Link to="/login" />}
                          />}

                      </IconMenu>
                      <IconButton
                        containerElement={<a
                          href="https://document.anontown.com/"
                          target="_blank"
                        />}
                      >
                        <FontIcon className="material-icons">help</FontIcon>
                      </IconButton>
                    </ToolbarGroup>
                  </Toolbar>
                  <div className={style.main}>
                    <Switch location={isModal ? this.previousLocation : location}>
                      <Route exact={true} path="/" component={pages.HomePage} />
                      <Route exact={true} path="/res/:id" component={pages.ResPage} />
                      <Route exact={true} path="/res/:id/reply" component={pages.ResReplyPage} />
                      <Route exact={true} path="/hash/:hash" component={pages.ResHashPage} />
                      <Route exact={true} path="/topic/search" component={pages.TopicSearchPage} />
                      <Route exact={true} path="/topic/create" component={pages.TopicCreatePage} />
                      <Route exact={true} path="/topic/:id" component={pages.TopicPage} />
                      <Route exact={true} path="/topic/:id/data" component={pages.TopicDataPage} />
                      <Route exact={true} path="/topic/:id/fork" component={pages.TopicForkPage} />
                      <Route exact={true} path="/topic/:id/edit" component={pages.TopicEditPage} />
                      <Route exact={true} path="/profiles" component={pages.ProfilesPage} />
                      <Route exact={true} path="/notifications" component={pages.NotificationsPage} />
                      <Route exact={true} path="/messages" component={pages.MessagesPage} />
                      <Route exact={true} path="/signup" component={pages.SignupPage} />
                      <Route exact={true} path="/login" component={pages.LoginPage} />
                      <Route exact={true} path="/auth" component={pages.AuthPage} />
                      <Route path="/settings" component={pages.SettingsPage} />
                      <Route exact={true} path="/profile/:id" component={pages.ProfilePage} />
                      <Route component={pages.NotFoundPage} />
                    </Switch>
                    {isModal ? <Route path="/res/:id" component={pages.ResModal} /> : null}
                    {isModal ? <Route path="/res/:id/reply" component={pages.ResReplyModal} /> : null}
                    {isModal ? <Route path="/profile/:id" component={pages.ProfileModal} /> : null}
                    {isModal ? <Route path="/topic/:id/data" component={pages.TopicDataModal} /> : null}
                    {isModal ? <Route path="/topic/:id/fork" component={pages.TopicForkModal} /> : null}
                    {isModal ? <Route path="/topic/:id/edit" component={pages.TopicEditModal} /> : null}
                    {isModal ? <Route path="/hash/:hash" component={pages.ResHashModal} /> : null}
                  </div>
                </div>;
              }}
            </User>
            : null)
          : <div><p>サーバーに障害が発生しているかメンテナンス中です。最新情報は<a href="https://twitter.com/anontown_bbs">Twitter</a>をご覧ください。</p>
            <TwitterTimelineEmbed
              sourceType="profile"
              screenName="anontown_bbs"
              options={{ height: "60vh" }}
            />
          </div>}
      </MuiThemeProvider>
    );
  }
});
