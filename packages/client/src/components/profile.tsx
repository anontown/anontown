import * as React from "react";
import * as G from "../../generated/graphql";
import { Md } from "./md";

export interface ProfileProps {
  profile: G.ProfileFragment;
}

interface ProfileState {
}

export class Profile extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.profile.name}●{this.props.profile.sn}
        <hr />
        <Md text={this.props.profile.text} />
      </div>
    );
  }
}
