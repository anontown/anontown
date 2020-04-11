import { routes } from "@anontown/common/lib/route";
import { Tab, Tabs } from "material-ui";
import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Page } from "../components";
import { TagFavo, TopicFavo } from "../components";
import { useUserContext } from "../hooks";
import { Card } from "../styled/card";

interface HomePageProps {}

export const HomePage = (_props: HomePageProps) => {
  const userContext = useUserContext();
  return (
    <Page>
      <Helmet title="Anontown" />
      {userContext.value !== null ? (
        <Tabs>
          <Tab label="トピック">
            <TopicFavo detail={true} userData={userContext.value} />
          </Tab>
          <Tab label="タグ">
            <TagFavo userData={userContext.value} />
          </Tab>
        </Tabs>
      ) : (
        <Card>
          <h1>匿名掲示板Anontownへようこそ</h1>
          <ul>
            <li>
              <Link to={routes.topicSearch.to({})}>トピック一覧</Link>
            </li>
            <li>
              <a
                href="https://document.anontown.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                説明書
              </a>
            </li>
          </ul>
        </Card>
      )}
    </Page>
  );
};
