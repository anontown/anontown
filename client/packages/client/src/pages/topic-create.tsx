import { routes } from "@anontown/route";
import { Mutation } from "@apollo/react-components";
import * as Im from "immutable";
import {
  MenuItem,
  Paper,
  RaisedButton,
  SelectField,
  TextField,
} from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Errors, MdEditor, Modal, Page, TagsInput } from "../components";
import * as G from "../generated/graphql";
import { userSwitch, UserSwitchProps } from "../utils";

type TopicCreatePageProps = RouteComponentProps<{}> & UserSwitchProps;

export interface TopicCreatePageState {
  title: string;
  tags: Im.Set<string>;
  text: string;
  type: "TopicNormal" | "TopicOne";
  openDialog: boolean;
}

export const TopicCreatePage = userSwitch(
  withRouter(
    class extends React.Component<TopicCreatePageProps, TopicCreatePageState> {
      constructor(props: TopicCreatePageProps) {
        super(props);
        this.state = {
          title: "",
          tags: Im.Set(),
          text: "",
          type: "TopicOne",
          openDialog: false,
        };
      }

      render() {
        return (
          <Page>
            <Helmet title="トピック作成" />
            <Paper>
              <Mutation<
                G.CreateTopicNormalMutation | G.CreateTopicOneMutation,
                | G.CreateTopicNormalMutationVariables
                | G.CreateTopicOneMutationVariables
              >
                mutation={
                  this.state.type === "TopicNormal"
                    ? G.CreateTopicNormalDocument
                    : G.CreateTopicOneDocument
                }
                variables={{
                  title: this.state.title,
                  tags: this.state.tags.toArray(),
                  text: this.state.text,
                }}
                onCompleted={x => {
                  this.props.history.push(
                    routes.topic.to({
                      id: ("createTopicNormal" in x
                        ? x.createTopicNormal
                        : x.createTopicOne
                      ).id,
                    }),
                  );
                }}
              >
                {(submit, { error }) => {
                  return (
                    <form>
                      <Modal
                        isOpen={this.state.openDialog}
                        onRequestClose={() =>
                          this.setState({ openDialog: false })
                        }
                      >
                        <h1>確認</h1>
                        ニュース・ネタ・実況などは単発トピックで建てて下さい。
                        <br />
                        本当に建てますか？
                        <RaisedButton
                          label={"はい"}
                          onClick={() => {
                            this.setState({ openDialog: false });
                            submit();
                          }}
                        />
                        <RaisedButton
                          label={"いいえ"}
                          onClick={() => this.setState({ openDialog: false })}
                        />
                      </Modal>
                      {error && <Errors errors={["エラーが発生しました"]} />}
                      <div>
                        <SelectField
                          floatingLabelText="種類"
                          value={this.state.type}
                          onChange={(_e, _i, v) => this.setState({ type: v })}
                        >
                          <MenuItem value="TopicOne" primaryText="単発" />
                          <MenuItem value="TopicNormal" primaryText="通常" />
                        </SelectField>
                      </div>
                      <div>
                        <TextField
                          floatingLabelText="タイトル"
                          value={this.state.title}
                          onChange={(_e, v) => this.setState({ title: v })}
                        />
                      </div>
                      <div>
                        <TagsInput
                          value={this.state.tags}
                          onChange={v => this.setState({ tags: v })}
                        />
                      </div>
                      <MdEditor
                        value={this.state.text}
                        onChange={v => this.setState({ text: v })}
                      />
                      <div>
                        <RaisedButton
                          onClick={() => {
                            if (this.state.type === "TopicNormal") {
                              this.setState({ openDialog: true });
                            } else {
                              submit();
                            }
                          }}
                          label="トピック作成"
                        />
                      </div>
                    </form>
                  );
                }}
              </Mutation>
            </Paper>
          </Page>
        );
      }
    },
  ),
);
