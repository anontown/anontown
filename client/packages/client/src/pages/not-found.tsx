import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Page } from "../components";

export const NotFoundPage = (_props: {}) => {
  return (
    <Page>
      <Helmet title="NotFound" />
      <Paper>ページが見つかりません</Paper>
    </Page>
  );
};
