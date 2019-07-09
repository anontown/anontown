import { List, ListItem, Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Link, Route, Switch } from "react-router-dom";
import { Page } from "../components";

interface SettingsPageProps extends RouteComponentProps<{}> {}

export const SettingsPage = withRouter((_props: SettingsPageProps) => {
  return (
    <Page>
      <Helmet title="アカウント設定" />
      <Paper>
        <Link to="/settings/account">アカウント設定</Link>
      </Paper>
      <Paper>
        <Link to="/settings/apps">連携アプリ</Link>
      </Paper>
      <Paper>
        <Link to="/settings/dev">開発者向け</Link>
      </Paper>
    </Page>
  );
});
