import * as React from "react";
import { Helmet } from "react-helmet";
import useRouter from "use-react-router";
import { Page, ProfileEditor } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";
import { pipe, O, RA } from "../prelude";
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

  const profile = pipe(
    O.fromNullable(profiles.data),
    O.map(x => x.profiles),
    O.chain(RA.head),
    O.toUndefined,
  );

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
