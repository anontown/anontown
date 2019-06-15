import { Paper } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import {
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
import * as G from "../../generated/graphql";
import { Page, Res, Snack } from "../components";
import {
  withModal,
} from "../utils";

type ResHashBaseProps = RouteComponentProps<{ hash: string }>;

interface ResHashBaseState {
}

const ResHashBase = withRouter(class extends React.Component<ResHashBaseProps, ResHashBaseState> {
  constructor(props: ResHashBaseProps) {
    super(props);
  }

  render() {
    const hash = decodeURIComponent(this.props.match.params.hash);

    return (
      <div>
        <Helmet title={`HASH:${hash}`} />
        <G.FindResesComponent
          variables={{ query: { hash } }}
        >
          {({ loading, error, data }) => {
            if (loading) { return "Loading..."; }
            if (error || !data) { return (<Snack msg="レス取得に失敗しました" />); }
            return data.reses.map(res => <Paper key={res.id}>
              <Res res={res} />
            </Paper>);
          }}
        </G.FindResesComponent>
      </div>
    );
  }
});

export function ResHashPage() {
  return <Page><ResHashBase /></Page>;
}

export const ResHashModal = withModal(() => <ResHashBase />, "ハッシュ");
