import { Tab, Tabs } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router";
import { Page, ProfileAdd, ProfileEditor, Snack } from "../components";
import * as G from "../generated/graphql";
import { userSwitch, UserSwitchProps, queryResultConvert } from "../utils";

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
        <Tabs>
          <Tab label="編集">
            {profiles.data !== undefined
              ? profiles.data.profiles.map(p => (
                  <ProfileEditor
                    style={{ marginBottom: 10 }}
                    key={p.id}
                    profile={p}
                    userData={props.userData}
                  />
                ))
              : null}
          </Tab>
          <Tab label="新規">
            <ProfileAdd userData={props.userData} />
          </Tab>
        </Tabs>
      </Page>
    );
  }),
);
