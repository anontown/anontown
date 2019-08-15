import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Page, Res, Snack } from "../components";
import * as G from "../generated/graphql";
import { withModal } from "../utils";

type ResReplyBaseProps = RouteComponentProps<{ id: string }>;

interface ResReplyBaseState {}

const ResReplyBase = withRouter(
  class extends React.Component<ResReplyBaseProps, ResReplyBaseState> {
    constructor(props: ResReplyBaseProps) {
      super(props);
    }

    render() {
      return (
        <div>
          <Helmet title="リプライ" />
          <G.FindResesComponent
            variables={{ query: { reply: this.props.match.params.id } }}
          >
            {({ loading, error, data }) => {
              if (loading) {
                return <span>Loading...</span>;
              }
              if (error || !data) {
                return <Snack msg="レス取得に失敗しました" />;
              }
              return (
                <>
                  {data.reses.map(res => (
                    <Res res={res} key={res.id} />
                  ))}
                </>
              );
            }}
          </G.FindResesComponent>
        </div>
      );
    }
  },
);

export function ResReplyPage() {
  return (
    <Page>
      <ResReplyBase />
    </Page>
  );
}

export const ResReplyModal = withModal(() => <ResReplyBase />, "リプライ");
