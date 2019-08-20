import { arrayGet, pipe, undefinedMap } from "@kgtkr/utils";
import * as React from "react";
import { Helmet } from "react-helmet";
import useRouter from "use-react-router";
import { Page, ProfileEditor } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";
type ProfileEditPageProps = UserSwitchProps;

export const ProfileEditPage = userSwitch((props: ProfileEditPageProps) => {
  const { match } = useRouter<{ id: string }>();
  const profiles = G.useFindProfilesQuery({
    variables: {
      query: {
        id: [match.params.id],
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
});
