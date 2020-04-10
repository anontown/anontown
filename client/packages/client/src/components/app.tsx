import { routes } from "@anontown/common/lib/route";
import * as t from "io-ts";
import {
  FontIcon,
  IconButton,
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
import { TwitterTimelineEmbed } from "react-twitter-embed";
import { UserData } from "../models";
import { BUILD_DATE, Env } from "../env";
import * as G from "../generated/graphql";
import { UserContextType } from "../hooks";
import * as pages from "../pages";
import {
  createHeaders,
  createUserData,
  dateFormat,
  getServerStatus,
  gqlClient,
  User,
} from "../utils";
import * as style from "./app.scss";
import { PopupMenu } from "./popup-menu";

declare const gtag: any;

const muiTheme = getMuiTheme(lightBaseTheme);

interface AppProps extends RouteComponentProps<{}> {}

interface AppState {
  initUserData?: UserData | null;
  serverStatus: boolean;
}

export const App = withRouter(
  class extends React.Component<AppProps, AppState> {
    previousLocation = this.props.location;

    constructor(props: AppProps) {
      super(props);
      this.state = {
        serverStatus: true,
      };
      this.changeLocation(this.props);
      getServerStatus().then(x => {
        this.setState({ serverStatus: x });
      });
    }

    componentDidUpdate(prevProps: AppProps) {
      if (this.props.location !== prevProps.location) {
        this.changeLocation(this.props);
      }
    }

    changeLocation(prop: AppProps) {
      const path = prop.location.pathname;
      if (Env.ga !== null) {
        gtag("config", Env.ga.id, {
          page_path: path,
        });
      }
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
        if ((res.data.token.__typename as string) === "TokenGeneral") {
          throw Error();
        }
        this.setState({
          initUserData: await createUserData(
            res.data.token as G.TokenMasterFragment,
          ),
        });
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
          {this.state.serverStatus ? (
            this.state.initUserData !== undefined ? (
              <User initUserData={this.state.initUserData}>
                {user => {
                  return (
                    <div className={style.container}>
                      <Toolbar className={style.header}>
                        <ToolbarGroup firstChild={true} className={style.big}>
                          <ToolbarTitle text="Anontown" />
                          <ToolbarTitle
                            text={`build:${dateFormat.format(BUILD_DATE)}`}
                            style={{ fontSize: "0.5rem" }}
                          />
                        </ToolbarGroup>
                        <ToolbarGroup>
                          <IconButton
                            containerElement={<Link to={routes.home.to({})} />}
                          >
                            <FontIcon className="material-icons">home</FontIcon>
                          </IconButton>
                          <IconButton
                            containerElement={
                              <Link to={routes.topicSearch.to({})} />
                            }
                          >
                            <FontIcon className="material-icons">
                              search
                            </FontIcon>
                          </IconButton>
                          {user.value !== null ? (
                            <IconButton
                              containerElement={
                                <Link to={routes.notifications.to({})} />
                              }
                            >
                              <FontIcon className="material-icons">
                                notifications
                              </FontIcon>
                            </IconButton>
                          ) : null}
                          <PopupMenu
                            trigger={
                              <IconButton touch={true}>
                                <FontIcon className="material-icons">
                                  people
                                </FontIcon>
                              </IconButton>
                            }
                          >
                            {user.value !== null ? (
                              <>
                                <MenuItem
                                  primaryText="プロフ管理"
                                  containerElement={
                                    <Link to={routes.profiles.to({})} />
                                  }
                                />
                                <MenuItem
                                  primaryText="お知らせ"
                                  containerElement={
                                    <Link to={routes.messages.to({})} />
                                  }
                                />
                                <MenuItem
                                  primaryText="設定"
                                  containerElement={
                                    <Link to={routes.settings.to({})} />
                                  }
                                />
                                <MenuItem
                                  primaryText="ログアウト"
                                  onClick={() => {
                                    this.logout(user);
                                  }}
                                />
                              </>
                            ) : (
                              <MenuItem
                                primaryText="ログイン"
                                containerElement={
                                  <Link to={routes.login.to({})} />
                                }
                              />
                            )}
                          </PopupMenu>
                        </ToolbarGroup>
                      </Toolbar>
                      <div className={style.main}>
                        <Switch
                          location={isModal ? this.previousLocation : location}
                        >
                          <Route
                            exact={true}
                            path={routes.home.matcher()}
                            component={pages.HomePage}
                          />
                          <Route
                            exact={true}
                            path={routes.res.matcher()}
                            component={pages.ResPage}
                          />
                          <Route
                            exact={true}
                            path={routes.resReply.matcher()}
                            component={pages.ResReplyPage}
                          />
                          <Route
                            exact={true}
                            path={routes.hash.matcher()}
                            component={pages.ResHashPage}
                          />
                          <Route
                            exact={true}
                            path={routes.topicSearch.matcher()}
                            component={pages.TopicSearchPage}
                          />
                          <Route
                            exact={true}
                            path={routes.topicCreate.matcher()}
                            component={pages.TopicCreatePage}
                          />
                          <Route
                            exact={true}
                            path={routes.topic.matcher()}
                            component={pages.TopicPage}
                          />
                          <Route
                            exact={true}
                            path={routes.topicData.matcher()}
                            component={pages.TopicDataPage}
                          />
                          <Route
                            exact={true}
                            path={routes.topicFork.matcher()}
                            component={pages.TopicForkPage}
                          />
                          <Route
                            exact={true}
                            path={routes.topicEdit.matcher()}
                            component={pages.TopicEditPage}
                          />
                          <Route
                            exact={true}
                            path={routes.profiles.matcher()}
                            component={pages.ProfilesPage}
                          />
                          <Route
                            exact={true}
                            path={routes.profileEdit.matcher()}
                            component={pages.ProfileEditPage}
                          />
                          <Route
                            exact={true}
                            path={routes.profileCreate.matcher()}
                            component={pages.ProfileCreatePage}
                          />
                          <Route
                            exact={true}
                            path={routes.notifications.matcher()}
                            component={pages.NotificationsPage}
                          />
                          <Route
                            exact={true}
                            path={routes.messages.matcher()}
                            component={pages.MessagesPage}
                          />
                          <Route
                            exact={true}
                            path={routes.signup.matcher()}
                            component={pages.SignupPage}
                          />
                          <Route
                            exact={true}
                            path={routes.login.matcher()}
                            component={pages.LoginPage}
                          />
                          <Route
                            exact={true}
                            path={routes.auth.matcher()}
                            component={pages.AuthPage}
                          />
                          <Route
                            exact={true}
                            path={routes.settings.matcher()}
                            component={pages.SettingsPage}
                          />
                          <Route
                            exact={true}
                            path={routes.accountSetting.matcher()}
                            component={pages.AccountSettingPage}
                          />
                          <Route
                            exact={true}
                            path={routes.appsSetting.matcher()}
                            component={pages.AppsSettingPage}
                          />
                          <Route
                            exact={true}
                            path={routes.devSetting.matcher()}
                            component={pages.DevSettingPage}
                          />
                          <Route
                            exact={true}
                            path={routes.profile.matcher()}
                            component={pages.ProfilePage}
                          />
                          <Route component={pages.NotFoundPage} />
                        </Switch>
                        {isModal ? (
                          <Route
                            path={routes.res.matcher()}
                            component={pages.ResModal}
                          />
                        ) : null}
                        {isModal ? (
                          <Route
                            path={routes.resReply.matcher()}
                            component={pages.ResReplyModal}
                          />
                        ) : null}
                        {isModal ? (
                          <Route
                            path={routes.profile.matcher()}
                            component={pages.ProfileModal}
                          />
                        ) : null}
                        {isModal ? (
                          <Route
                            path={routes.topicData.matcher()}
                            component={pages.TopicDataModal}
                          />
                        ) : null}
                        {isModal ? (
                          <Route
                            path={routes.topicFork.matcher()}
                            component={pages.TopicForkModal}
                          />
                        ) : null}
                        {isModal ? (
                          <Route
                            path={routes.topicEdit.matcher()}
                            component={pages.TopicEditModal}
                          />
                        ) : null}
                        {isModal ? (
                          <Route
                            path={routes.hash.matcher()}
                            component={pages.ResHashModal}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                }}
              </User>
            ) : null
          ) : (
            <div>
              <p>
                サーバーに障害が発生しているかメンテナンス中です。最新情報は
                <a href="https://twitter.com/anontown_bbs">Twitter</a>
                をご覧ください。
              </p>
              <TwitterTimelineEmbed
                sourceType="profile"
                screenName="anontown_bbs"
                options={{ height: "60vh" }}
              />
            </div>
          )}
        </MuiThemeProvider>
      );
    }
  },
);
