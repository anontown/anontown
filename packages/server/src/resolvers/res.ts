import * as G from "../generated/graphql";
import { getTopic } from "../usecases";

const resBase: Pick<G.ResResolvers, "topic"> = {
  topic: async (res, _args, context, _info) => {
    const topic = await getTopic({ id: res.topicID }, context.ports);
    return topic;
  },
};

export const res: G.ResResolvers = {
  __resolveType(obj) {
    switch (obj.type) {
      case "normal":
        return "ResNormal";
      case "history":
        return "ResHistory";
      case "topic":
        return "ResTopic";
      case "fork":
        return "ResFork";
      case "delete":
        return "ResDelete";
    }
  },
};

export const resNormal: G.ResNormalResolvers = {
  ...resBase,
  reply: async (res, _args, context, _info) => {
    if (res.replyID !== null) {
      const reply = await context.ports.resLoader.load(res.replyID);
      return reply.toAPI(context.ports.authContainer.getTokenOrNull());
    } else {
      return null;
    }
  },
  profile: async (res, _args, context, _info) => {
    if (res.profileID !== null) {
      const profile = await context.ports.profileLoader.load(res.profileID);
      return profile.toAPI(context.ports.authContainer.getTokenOrNull());
    } else {
      return null;
    }
  },
};

export const resHistory: G.ResHistoryResolvers = {
  ...resBase,
  history: async (res, _args, context, _info) => {
    const history = await context.ports.historyLoader.load(res.historyID);
    return history.toAPI(context.ports.authContainer.getTokenOrNull());
  },
};

export const resTopic: G.ResTopicResolvers = {
  ...resBase,
};

export const resFork: G.ResForkResolvers = {
  ...resBase,
  fork: async (res, _args, context, _info) => {
    const fork = await getTopic({ id: res.forkID }, context.ports);
    if (fork.type !== "fork") {
      throw new Error();
    }
    return fork;
  },
};

export const resDelete: G.ResDeleteResolvers = {
  ...resBase,
};
