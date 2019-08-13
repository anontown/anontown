import { arrayGet, pipe, undefinedMap } from "@kgtkr/utils";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router";
import { Page, ProfileEditor } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";
type ProfileEditPageProps = RouteComponentProps<{ id: string }> &
  UserSwitchProps;

export const ProfileEditPage = userSwitch(
  withRouter((props: ProfileEditPageProps) => {
    const profiles = G.useFindProfilesQuery({
      variables: {
        query: {
          id: [props.match.params.id],
        },
      },
    });
    queryResultConvert(profiles);

    const profile = pipe(profiles.data)
      .chain(undefinedMap(x => x.profiles))
      .chain(undefinedMap(arrayGet(0))).value;

    return (
      <Page>
        <Helmet title="プロフィール管理" />
        {profile !== undefined ? (
          <ProfileEditor
            style={{ marginBottom: 10 }}
            key={profile.id}
            profile={profile}
            userData={props.userData}
          />
        ) : null}
      </Page>
    );
  }),
);
