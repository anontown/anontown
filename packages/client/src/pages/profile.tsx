import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import {
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
import * as G from "../../generated/graphql";
import { Page, Profile, Snack } from "../components";
import {
  withModal,
} from "../utils";

interface ProfileBaseProps extends RouteComponentProps<{ id: string }> {
  zDepth?: number;
}

interface ProfileBaseState {
}

const ProfileBase = withRouter(class extends React.Component<ProfileBaseProps, ProfileBaseState> {
  constructor(props: ProfileBaseProps) {
    super(props);
  }

  render() {
    return (
      <div>
        <Helmet title="プロフィール" />
        <G.FindProfilesComponent
          variables={{ query: { id: [this.props.match.params.id] } }}
        >
          {({ loading, error, data }) => {
            if (loading) { return "Loading..."; }
            if (error || !data || data.profiles.length === 0) { return (<Snack msg="プロフィール取得に失敗しました" />); }

            return (
              <Paper zDepth={this.props.zDepth}>
                <Helmet title={`●${data.profiles[0].sn}`} />
                <Profile profile={data.profiles[0]} />
              </Paper>
            );
          }}
        </G.FindProfilesComponent>
      </div>
    );
  }
});

export function ProfilePage() {
  return <Page><ProfileBase /></Page>;
}

export const ProfileModal = withModal(() => <ProfileBase zDepth={0} />, "プロフィール");
