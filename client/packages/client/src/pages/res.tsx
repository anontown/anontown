import * as React from "react";
import { Helmet } from "react-helmet";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { Page, Res, Snack } from "../components";
import * as G from "../generated/graphql";
import { withModal } from "../utils";

interface ResBaseProps extends RouteComponentProps<{ id: string }> {
  zDepth?: number;
}

interface ResBaseState {}

const ResBase = withRouter(
  class extends React.Component<ResBaseProps, ResBaseState> {
    constructor(props: ResBaseProps) {
      super(props);
    }

    render() {
      return (
        <div>
          <Helmet title="レス" />
          <G.FindResesComponent
            variables={{ query: { id: [this.props.match.params.id] } }}
          >
            {({ loading, error, data }) => {
              if (loading) {
                return <span>Loading...</span>;
              }
              if (error || !data || data.reses.length === 0) {
                return <Snack msg="レス取得に失敗しました" />;
              }

              return <Res res={data.reses[0]} />;
            }}
          </G.FindResesComponent>
        </div>
      );
    }
  },
);

export function ResPage() {
  return (
    <Page>
      <ResBase />
    </Page>
  );
}

export const ResModal = withModal(() => <ResBase zDepth={0} />, "レス詳細");
