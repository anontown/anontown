import * as React from "react";
import { useTitle } from "react-use";
import useRouter from "use-react-router";
import { Page, Res, Snack } from "../components";
import * as G from "../generated/graphql";
import { withModal } from "../utils";

function ResHashBase(_props: {}) {
  const { match } = useRouter<{ hash: string }>();
  const hash = decodeURIComponent(match.params.hash);
  const resesResult = G.useFindResesQuery({ variables: { query: { hash } } });
  useTitle(`HASH:${hash}`);

  return (
    <div>
      {resesResult.loading ? <span>Loading...</span> : null}
      {resesResult.error !== undefined ? (
        <Snack msg="レス取得に失敗しました" />
      ) : null}
      {resesResult.data !== undefined
        ? resesResult.data.reses.map(res => <Res res={res} key={res.id} />)
        : undefined}
    </div>
  );
}

export function ResHashPage() {
  return (
    <Page>
      <ResHashBase />
    </Page>
  );
}

export const ResHashModal = withModal(() => <ResHashBase />, "ハッシュ");
