import * as G from "../generated/graphql";

export const query: G.QueryResolvers = {
  userID: async (_obj, args, context, _info) => {
    return await context.userRepo.findID(args.sn);
  },
  userSN: async (_obj, args, context, _info) => {
    return (await context.userRepo.findOne(args.id)).sn;
  },
  user: async (_obj, _args, context, _info) => {
    return (await context.userRepo.findOne(
      context.authContainer.getToken().user,
    )).toAPI();
  },
  clients: async (_obj, args, context, _info) => {
    const clients = await context.clientRepo.find(
      context.authContainer.getTokenMasterOrNull(),
      args.query,
    );
    return clients.map(c =>
      c.toAPI(context.authContainer.getTokenMasterOrNull()),
    );
  },
  histories: async (_obj, args, context, _info) => {
    const histories = await context.historyRepo.find(args.query, args.limit);
    return histories.map(x => x.toAPI(context.authContainer.getTokenOrNull()));
  },
  msgs: async (_obj, args, context, _info) => {
    const msgs = await context.msgRepo.find(
      context.authContainer.getToken(),
      args.query,
      args.limit,
    );
    return msgs.map(x => x.toAPI(context.authContainer.getToken()));
  },
  profiles: async (_obj, args, context, _info) => {
    const profiles = await context.profileRepo.find(
      context.authContainer,
      args.query,
    );
    return profiles.map(p => p.toAPI(context.authContainer.getTokenOrNull()));
  },
  reses: async (_obj, args, context, _info: any) => {
    const reses = await context.resRepo.find(
      context.authContainer,
      args.query,
      args.limit,
    );
    return reses.map(x => x.toAPI(context.authContainer.getTokenOrNull()));
  },
  storages: async (_obj, args, context, _info) => {
    const storages = await context.storageRepo.find(
      context.authContainer.getToken(),
      args.query,
    );
    return storages.map(x => x.toAPI(context.authContainer.getToken()));
  },
  token: async (_obj, _args, context, _info) => {
    const token = await context.tokenRepo.findOne(
      context.authContainer.getToken().id,
    );
    return token.toAPI();
  },
  tokens: async (_obj, _args, context, _info: any) => {
    const tokens = await context.tokenRepo.findAll(
      context.authContainer.getTokenMaster(),
    );
    return tokens.map(t => t.toAPI());
  },
  topics: async (_obj, args, context, _info) => {
    const topic = await context.topicRepo.find(
      args.query,
      args.skip,
      args.limit,
    );
    return topic.map(t => t.toAPI());
  },
  topicTags: async (_obj, args, context, _info) => {
    return await context.topicRepo.findTags(args.limit);
  },
};
