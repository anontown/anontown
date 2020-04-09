import { routes } from "@anontown/common/dist/route";
import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Page } from "../components";

export const SettingsPage = (_props: {}) => {
  return (
    <Page>
      <Helmet title="アカウント設定" />
      <Paper>
        <Link to={routes.accountSetting.to({})}>アカウント設定</Link>
      </Paper>
      <Paper>
        <Link to={routes.appsSetting.to({})}>連携アプリ</Link>
      </Paper>
      <Paper>
        <Link to={routes.devSetting.to({})}>開発者向け</Link>
      </Paper>
    </Page>
  );
};
