import * as React from "react";
import { Helmet } from "react-helmet";
import { Page, ProfileAdd } from "../components";
import { userSwitch, UserSwitchProps } from "../utils";

type ProfileCreatePageProps = UserSwitchProps;

export const ProfileCreatePage = userSwitch((props: ProfileCreatePageProps) => {
  return (
    <Page>
      <Helmet title="プロフィール作成" />
      <ProfileAdd userData={props.userData} />
    </Page>
  );
});
