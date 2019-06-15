import {
  Tab,
  Tabs,
} from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router";
import * as G from "../../generated/graphql";
import {
  Page,
  ProfileAdd,
  ProfileEditor,
  Snack,
} from "../components";
import { userSwitch, UserSwitchProps } from "../utils";

type ProfilesPageProps = RouteComponentProps & UserSwitchProps;

export interface ProfilesPageState {
}

export const ProfilesPage = userSwitch(withRouter(class extends React.Component<ProfilesPageProps, ProfilesPageState> {
  constructor(props: ProfilesPageProps) {
    super(props);
  }

  render() {
    return (
      <Page>
        <Helmet title="プロフィール管理" />
        <Tabs>
          <Tab label="編集">
            <G.FindProfilesComponent variables={{ query: { self: true } }}>
              {({ loading, error, data }) => {
                if (loading) { return "Loading..."; }
                if (error || !data) { return (<Snack msg="プロフィール取得に失敗しました" />); }

                return (
                  data.profiles.map(p =>
                    <ProfileEditor
                      style={{ marginBottom: 10 }}
                      key={p.id}
                      profile={p}
                      userData={this.props.userData}
                    />)
                );
              }}</G.FindProfilesComponent>
          </Tab>
          <Tab label="新規">
            <ProfileAdd
              userData={this.props.userData}
            />
          </Tab>
        </Tabs>
      </Page>
    );
  }
}));
