import * as routes from "./routes";
import { RouteData } from "./route-data";
export { RouteData, RouteDataToParams } from "./route-data";
export { routes };
export const routeArray: Array<RouteData<string, {}>> = [
  routes.home,
  routes.res,
  routes.resReply,
  routes.hash,
  routes.topicSearch,
  routes.topicCreate,
  routes.topic,
  routes.topicData,
  routes.topicFork,
  routes.topicEdit,
  routes.profiles,
  routes.profileCreate,
  routes.profile,
  routes.profileEdit,
  routes.notifications,
  routes.messages,
  routes.signup,
  routes.login,
  routes.auth,
  routes.settings,
  routes.accountSetting,
  routes.appsSetting,
  routes.devSetting,
];
