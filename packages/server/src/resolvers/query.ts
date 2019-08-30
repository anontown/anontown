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
      context.auth.getToken().user,
    )).toAPI();
  },
  clients: async (_obj, args, context, _info) => {
    const clients = await context.clientRepo.find(
      context.auth.getTokenMasterOrNull(),
      args.query,
    );
    return clients.map(c => c.toAPI(context.auth.getTokenMasterOrNull()));
  },
  histories: async (_obj, args, context, _info) => {
    const histories = await context.historyRepo.find(args.query, args.limit);
    return histories.map(x => x.toAPI(context.auth.getTokenOrNull()));
  },
  msgs: async (_obj, args, context, _info) => {
    const msgs = await context.msgRepo.find(
      context.auth.getToken(),
      args.query,
      args.limit,
    );
    return msgs.map(x => x.toAPI(context.auth.getToken()));
  },
  profiles: async (_obj, args, context, _info) => {
    const profiles = await context.profileRepo.find(context.auth, args.query);
    return profiles.map(p => p.toAPI(context.auth.getTokenOrNull()));
  },
  reses: async (_obj, args, context, _info: any) => {
    const reses = await context.resRepo.find(
      context.auth,
      args.query,
      args.limit,
    );
    return reses.map(x => x.toAPI(context.auth.getTokenOrNull()));
  },
  storages: async (_obj, args, context, _info) => {
    const storages = await context.storageRepo.find(
      context.auth.getToken(),
      args.query,
    );
    return storages.map(x => x.toAPI(context.auth.getToken()));
  },
  token: async (_obj, _args, context, _info) => {
    const token = await context.tokenRepo.findOne(context.auth.getToken().id);
    return token.toAPI();
  },
  tokens: async (_obj, _args, context, _info: any) => {
    const tokens = await context.tokenRepo.findAll(
      context.auth.getTokenMaster(),
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
