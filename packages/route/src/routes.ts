import { PathDataBuilder, RouteData } from "./route-data";
import * as qs from "query-string";

export interface NotFound {
  readonly type: "NotFound";
}

export interface Home {
  readonly type: "Home";
}

export interface Res {
  readonly type: "Res";
  readonly id: string;
}

export interface ResReply {
  readonly type: "ResReply";
  readonly id: string;
}

export interface Hash {
  readonly type: "Hash";
  readonly hash: string;
}

export interface TopicSearch {
  readonly type: "TopicSearch";
  readonly title: string;
  readonly tags: string[];
  readonly notDeadOnly: boolean;
}

export interface TopicCreate {
  readonly type: "TopicCreate";
}

export interface Topic {
  readonly type: "Topic";
  readonly id: string;
}

export interface TopicData {
  readonly type: "TopicData";
  readonly id: string;
}

export interface TopicFork {
  readonly type: "TopicFork";
  readonly id: string;
}

export interface TopicEdit {
  readonly type: "TopicEdit";
  readonly id: string;
}

export interface Profiles {
  readonly type: "Profiles";
}

export interface ProfileEdit {
  readonly type: "ProfileEdit";
  readonly id: string;
}

export interface Notifications {
  readonly type: "Notifications";
}

export interface Messages {
  readonly type: "Messages";
}

export interface Signup {
  readonly type: "Signup";
}

export interface Login {
  readonly type: "Login";
}

export interface Auth {
  readonly type: "Auth";
  readonly id: string | null;
}

export interface Settings {
  readonly type: "Settings";
}

export interface Settings {
  readonly type: "Settings";
}

export interface AccountSetting {
  readonly type: "AccountSetting";
}

export interface AppsSetting {
  readonly type: "AppsSetting";
}

export interface DevSetting {
  readonly type: "DevSetting";
}

export interface Profile {
  readonly type: "Profile";
}

export type Location =
  | NotFound
  | Home
  | Res
  | ResReply
  | Hash
  | TopicSearch
  | TopicCreate
  | Topic
  | TopicData
  | TopicFork
  | TopicEdit
  | Profiles
  | ProfileEdit
  | Notifications
  | Messages
  | Signup
  | Login
  | Auth
  | Settings
  | AccountSetting
  | AppsSetting
  | DevSetting
  | Profile;

export const notFound: Location = { type: "NotFound" };
export const home: Location = { type: "Home" };
export const res: (id: string) => Location = id => ({ type: "Res", id });
export const resReply: (id: string) => Location = id => ({
  type: "ResReply",
  id
});
export const hash: (hash: string) => Location = hash => ({
  type: "Hash",
  hash
});
export const topicSearch: (
  title: string,
  tags: string[],
  notDeadOnly: boolean
) => Location = (title, tags, notDeadOnly) => ({
  type: "TopicSearch",
  title,
  tags,
  notDeadOnly
});
export const topicCreate: Location = { type: "TopicCreate" };
export const topic: (id: string) => Location = id => ({ type: "Topic", id });
export const topicData: (id: string) => Location = id => ({
  type: "TopicData",
  id
});
export const topicFork: (id: string) => Location = id => ({
  type: "TopicFork",
  id
});
export const topicEdit: (id: string) => Location = id => ({
  type: "TopicEdit",
  id
});
export const profiles: Location = { type: "Profiles" };
export const profileEdit: (id: string) => Location = id => ({
  type: "ProfileEdit",
  id
});
export const notifications: Location = { type: "Notifications" };
export const messages: Location = { type: "Messages" };
export const signup: Location = { type: "Signup" };
export const login: Location = { type: "Login" };
export const auth: (id: string | null) => Location = id => ({
  type: "Auth",
  id
});
export const settings: Location = { type: "Settings" };
export const accountSetting: Location = { type: "AccountSetting" };
export const appsSetting: Location = { type: "AppsSetting" };
export const devSetting: Location = { type: "DevSetting" };
export const profile: Location = { type: "Profile" };

export const homeRouteData = RouteData.create(
  PathDataBuilder.create().const("")
);
export const resRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("res")
    .variable("id")
);
export const resReplyRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("res")
    .variable("id")
    .const("reply")
);
export const hashRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("hash")
    .variable("hash")
);
export const topicSearchRouteData = RouteData.createWithQuery(
  PathDataBuilder.create()
    .const("topic")
    .const("search"),
  query => {
    const title = RouteData.encodeOne(query["title"]);
    const tags = RouteData.encodeArray(query["tags"]);
    const dead = RouteData.encodeOne(query["dead"]);

    return {
      title: title !== undefined ? title : "",
      tags,
      dead: dead === "true"
    };
  },
  query => {
    const res: qs.ParsedQuery = {};
    if (query.title.length !== 0) {
      res["title"] = query.title;
    }

    if (query.tags.length !== 0) {
      res["tags"] = query.tags;
    }

    if (query.dead) {
      res["dead"] = "true";
    }

    return res;
  }
);
export const topicCreateRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .const("create")
);
export const topicRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
);
export const topicDataRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
    .const("data")
);
export const topicForkRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
    .const("fork")
);
export const topicEditRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("topic")
    .variable("id")
    .const("edit")
);
export const profilesRouteData = RouteData.create(
  PathDataBuilder.create().const("profiles")
);
export const profileEditRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("profiles")
    .variable("id")
);
export const notificationsRouteData = RouteData.create(
  PathDataBuilder.create().const("notifications")
);
export const messagesRouteData = RouteData.create(
  PathDataBuilder.create().const("messages")
);
export const signupRouteData = RouteData.create(
  PathDataBuilder.create().const("signup")
);
export const loginRouteData = RouteData.create(
  PathDataBuilder.create().const("login")
);
export const authRouteData = RouteData.createWithQuery(
  PathDataBuilder.create().const("auth"),
  query => {
    const id = RouteData.encodeOne(query["client"]);

    return {
      id: id
    };
  },
  query => {
    const res: qs.ParsedQuery = {};
    if (query.id !== undefined) {
      res["client"] = query.id;
    }

    return res;
  }
);
export const settingsRouteData = RouteData.create(
  PathDataBuilder.create().const("settings")
);
export const accountSettingRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("settings")
    .const("account")
);
export const appsSettingRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("settings")
    .const("apps")
);
export const devSettingRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("settings")
    .const("dev")
);
export const profileRouteData = RouteData.create(
  PathDataBuilder.create()
    .const("profile")
    .variable("id")
);
