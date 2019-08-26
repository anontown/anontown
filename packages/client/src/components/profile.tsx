import * as React from "react";
import * as G from "../generated/graphql";
import { Md } from "./md";

export interface ProfileProps {
  profile: G.ProfileFragment;
}

export function Profile(props: ProfileProps) {
  return (
    <div>
      {props.profile.name}@{props.profile.sn}
      <hr />
      <Md text={props.profile.text} />
    </div>
  );
}
