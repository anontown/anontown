import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router";
import { Page, ProfileAdd } from "../components";
import { userSwitch, UserSwitchProps } from "../utils";

type ProfileCreatePageProps = RouteComponentProps & UserSwitchProps;

export const ProfileCreatePage = userSwitch(
  withRouter((props: ProfileCreatePageProps) => {
    return (
      <Page>
        <Helmet title="プロフィール作成" />
        <ProfileAdd userData={props.userData} />
      </Page>
    );
  }),
);
