import { array, option } from "fp-ts";
import { pipe } from "fp-ts/lib/pipeable";
import { Paper } from "material-ui";
import * as React from "react";
import { useTitle } from "react-use";
import useRouter from "use-react-router";
import { Page, Profile, Snack } from "../components";
import * as G from "../generated/graphql";
import { withModal } from "../utils";

interface ProfileBaseProps {
  zDepth?: number;
}

function ProfileBase(props: ProfileBaseProps) {
  const { match } = useRouter<{ id: string }>();
  useTitle("プロフィール");
  const profilesResult = G.useFindProfilesQuery({
    variables: { query: { id: [match.params.id] } },
  });
  useTitle(
    pipe(
      profilesResult.data,
      option.fromNullable,
      option.map(x => x.profiles),
      option.chain(array.head),
      option.map(x => `●${x.sn}`),
      option.getOrElse(() => "プロフィール"),
    ),
  );

  return (
    <div>
      {profilesResult.loading ? <span>Loading...</span> : null}
      {profilesResult.error ? (
        <Snack msg="プロフィール取得に失敗しました" />
      ) : null}
      {profilesResult.data !== undefined
        ? pipe(
            profilesResult.data.profiles,
            array.head,
            option.map(p => (
              <Paper zDepth={props.zDepth}>
                <Profile profile={p} />
              </Paper>
            )),
            option.getOrElse(() => <Snack msg="プロフィールが存在しません" />),
          )
        : undefined}
    </div>
  );
}

export function ProfilePage() {
  return (
    <Page>
      <ProfileBase />
    </Page>
  );
}

export const ProfileModal = withModal(
  () => <ProfileBase zDepth={0} />,
  "プロフィール",
);
