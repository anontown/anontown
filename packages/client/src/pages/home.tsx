import {
  Paper,
  Tab,
  Tabs,
} from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import {
  Link,
} from "react-router-dom";
import { Page } from "../components";
import {
  TagFavo,
  TopicFavo,
} from "../components";
import { useUserContext } from "../utils";

interface HomePageProps { }

export const HomePage = (_props: HomePageProps) => {
  const userContext = useUserContext();
  return (
    <Page>
      <Helmet title="Anontown" />
      {userContext.value !== null
        ? <Tabs>
          <Tab label="トピック">
            <TopicFavo detail={true} userData={userContext.value} />
          </Tab>
          <Tab label="タグ">
            <TagFavo userData={userContext.value} />
          </Tab>
        </Tabs>
        : <Paper>
          <h1>匿名掲示板Anontownへようこそ</h1>
          <ul>
            <li>
              <Link to="/topic/search">トピック一覧</Link>
            </li>
            <li>
              <a
                href="https://document.anontown.com/"
                target="_blank"
              >
                説明書
              </a>
            </li>
          </ul>
        </Paper>}
    </Page>
  );
};
