import { List, ListItem } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Link, Route, Switch } from "react-router-dom";
import { Page } from "../../components";
import { AccountSettingPage } from "./account-setting";
import { AppsSettingPage } from "./apps-setting";
import { DevSettingPage } from "./dev-setting";

interface SettingsPageProps extends RouteComponentProps<{}> {

}

export const SettingsPage = withRouter((_props: SettingsPageProps) => {
  return (
    <Page
      sidebar={<List>
        <ListItem containerElement={<Link to="/settings/account" />}>アカウント設定</ListItem>
        <ListItem containerElement={<Link to="/settings/apps" />}>連携アプリ</ListItem>
        <ListItem containerElement={<Link to="/settings/dev" />}>開発者向け</ListItem>
      </List>}
    >
      <Helmet title="アカウント設定" />
      <Switch>
        <Route path="/settings/account" component={AccountSettingPage} />
        <Route path="/settings/apps" component={AppsSettingPage} />
        <Route path="/settings/dev" component={DevSettingPage} />
      </Switch>
    </Page>
  );
});
