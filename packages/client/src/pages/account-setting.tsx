import { Paper, RaisedButton, TextField } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Errors, Page, Snack } from "../components";
import * as G from "../generated/graphql";
import { queryResultConvert, userSwitch, UserSwitchProps } from "../utils";

type AccountSettingPageProps = UserSwitchProps;

export const AccountSettingPage = userSwitch(
  (props: AccountSettingPageProps) => {
    const [snackMsg, setSnackMsg] = React.useState<string | null>(null);
    const [newPass, setNewPass] = React.useState("");
    const [oldPass, setOldPass] = React.useState("");

    const user = G.useFindUserQuery();
    queryResultConvert(user);

    const [sn, setSn] = React.useState(
      user.data !== undefined ? user.data.user.sn : "",
    );
    const [updateUserSubmit] = G.useUpdateUserMutation();
    const [createTokenMasterSubmit] = G.useCreateTokenMasterMutation();

    return (
      <Page>
        <Paper>
          <Helmet title="アカウント設定" />
          <Snack msg={snackMsg} onHide={() => setSnackMsg(null)} />
          {user.error !== undefined ? (
            <Errors errors={["ユーザー情報取得に失敗しました"]} />
          ) : null}
          {user.loading ? <div>loading</div> : null}
          {user.data !== undefined ? (
            <form>
              <TextField
                floatingLabelText="ID"
                value={sn}
                onChange={(_e, v) => setSn(v)}
              />
              <TextField
                floatingLabelText="新しいパスワード"
                value={newPass}
                onChange={(_e, v) => setNewPass(v)}
              />
              <TextField
                floatingLabelText="現在のパスワード"
                value={oldPass}
                onChange={(_e, v) => setOldPass(v)}
              />
              <RaisedButton
                onClick={async () => {
                  if (user.data !== undefined) {
                    try {
                      await updateUserSubmit({
                        variables: {
                          sn,
                          pass: newPass,
                          auth: { id: user.data.user.id, pass: oldPass },
                        },
                      });
                      const token = await createTokenMasterSubmit({
                        variables: {
                          auth: { id: user.data.user.id, pass: newPass },
                        },
                      });
                      if (token.data !== undefined) {
                        props.updateUserData({
                          ...props.userData,
                          token: token.data
                            .createTokenMaster as G.TokenMasterFragment,
                        });
                      }
                    } catch {
                      setSnackMsg("エラーが発生しました");
                    }
                  }
                }}
                label="OK"
              />
            </form>
          ) : null}
        </Paper>
      </Page>
    );
  },
);
