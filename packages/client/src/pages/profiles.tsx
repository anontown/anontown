import { Tab, Tabs, Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router";
import { Page, ProfileAdd, ProfileEditor, Snack } from "../components";
import * as G from "../generated/graphql";
import { userSwitch, UserSwitchProps, queryResultConvert } from "../utils";
import { Link } from "react-router-dom";

type ProfilesPageProps = RouteComponentProps & UserSwitchProps;

export const ProfilesPage = userSwitch(
  withRouter((props: ProfilesPageProps) => {
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
        <ProfileAdd userData={props.userData} />
        {profiles.data !== undefined
          ? profiles.data.profiles.map(p => (
              <Paper key={p.id} style={{ padding: 10 }}>
                <Link to={`/profiles/${p.id}`}>●{p.sn}</Link>
              </Paper>
            ))
          : null}
      </Page>
    );
  }),
);
