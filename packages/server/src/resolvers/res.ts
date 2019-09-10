import * as G from "../generated/graphql";
import { getHistory, getProfile, getRes, getTopic } from "../usecases";

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
      const reply = await getRes({ id: res.replyID }, context.ports);
      return reply;
    } else {
      return null;
    }
  },
  profile: async (res, _args, context, _info) => {
    if (res.profileID !== null) {
      const profile = await getProfile({ id: res.profileID }, context.ports);
      return profile;
    } else {
      return null;
    }
  },
};

export const resHistory: G.ResHistoryResolvers = {
  ...resBase,
  history: async (res, _args, context, _info) => {
    const history = await getHistory({ id: res.historyID }, context.ports);
    return history;
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
