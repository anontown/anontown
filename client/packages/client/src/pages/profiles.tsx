import { routes } from "@anontown/common/dist/route";
import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Page } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";

type ProfilesPageProps = UserSwitchProps;

export const ProfilesPage = userSwitch((_props: ProfilesPageProps) => {
  const profiles = G.useFindProfilesQuery({
    variables: {
      query: {
        self: true,
      },
    },
  });
  queryResultConvert(profiles);

  return (
    <Page>
      <Helmet title="プロフィール管理" />
      <Paper style={{ padding: 10 }}>
        <Link to={routes.profileCreate.to({})}>作成</Link>
      </Paper>
      {profiles.data !== undefined
        ? profiles.data.profiles.map(p => (
            <Paper key={p.id} style={{ padding: 10 }}>
              <Link to={routes.profileEdit.to({ id: p.id })}>@{p.sn}</Link>
            </Paper>
          ))
        : null}
    </Page>
  );
});
