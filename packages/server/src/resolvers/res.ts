import * as G from "../generated/graphql";

const resBase: Pick<G.ResResolvers, "topic"> = {
  topic: async (res, _args, context, _info) => {
    const topic = await context.topicLoader.load(res.topicID);
    return topic.toAPI();
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
      const reply = await context.resLoader.load(res.replyID);
      return reply.toAPI(context.authContainer.getTokenOrNull());
    } else {
      return null;
    }
  },
  profile: async (res, _args, context, _info) => {
    if (res.profileID !== null) {
      const profile = await context.profileLoader.load(res.profileID);
      return profile.toAPI(context.authContainer.getTokenOrNull());
    } else {
      return null;
    }
  },
};

export const resHistory: G.ResHistoryResolvers = {
  ...resBase,
  history: async (res, _args, context, _info) => {
    const history = await context.historyLoader.load(res.historyID);
    return history.toAPI(context.authContainer.getTokenOrNull());
  },
};

export const resTopic: G.ResTopicResolvers = {
  ...resBase,
};

export const resFork: G.ResForkResolvers = {
  ...resBase,
  fork: async (res, _args, context, _info) => {
    const fork = await context.topicLoader.load(res.forkID);
    if (fork.type !== "fork") {
      throw new Error();
    }
    return fork.toAPI();
  },
};

export const resDelete: G.ResDeleteResolvers = {
  ...resBase,
};
