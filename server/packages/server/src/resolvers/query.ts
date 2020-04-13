import * as G from "../generated/graphql";

export const query: G.QueryResolvers = {
  userID: async (_obj, args, context, _info) => {
    return await context.ports.userRepo.findID(args.sn);
  },
  userSN: async (_obj, args, context, _info) => {
    return (await context.ports.userRepo.findOne(args.id)).sn;
  },
  user: async (_obj, _args, context, _info) => {
    return (
      await context.ports.userRepo.findOne(
        context.ports.authContainer.getToken().user,
      )
    ).toAPI();
  },
  clients: async (_obj, args, context, _info) => {
    const clients = await context.ports.clientRepo.find(
      context.ports.authContainer.getTokenMasterOrNull(),
      args.query,
    );
    return clients.map(c =>
      c.toAPI(context.ports.authContainer.getTokenMasterOrNull()),
    );
  },
  histories: async (_obj, args, context, _info) => {
    const histories = await context.ports.historyRepo.find(
      args.query,
      args.limit,
    );
    return histories.map(x =>
      x.toAPI(context.ports.authContainer.getTokenOrNull()),
    );
  },
  msgs: async (_obj, args, context, _info) => {
    const msgs = await context.ports.msgRepo.find(
      context.ports.authContainer.getToken(),
      args.query,
      args.limit,
    );
    return msgs.map(x => x.toAPI(context.ports.authContainer.getToken()));
  },
  profiles: async (_obj, args, context, _info) => {
    const profiles = await context.ports.profileRepo.find(
      context.ports.authContainer,
      args.query,
    );
    return profiles.map(p =>
      p.toAPI(context.ports.authContainer.getTokenOrNull()),
    );
  },
  reses: async (_obj, args, context, _info: any) => {
    const reses = await context.ports.resRepo.find(
      context.ports.authContainer,
      args.query,
      args.limit,
    );
    return reses.map(x =>
      x.toAPI(context.ports.authContainer.getTokenOrNull()),
    );
  },
  storages: async (_obj, args, context, _info) => {
    const storages = await context.ports.storageRepo.find(
      context.ports.authContainer.getToken(),
      args.query,
    );
    return storages.map(x => x.toAPI(context.ports.authContainer.getToken()));
  },
  token: async (_obj, _args, context, _info) => {
    const token = await context.ports.tokenRepo.findOne(
      context.ports.authContainer.getToken().id,
    );
    return token.toAPI();
  },
  tokens: async (_obj, _args, context, _info: any) => {
    const tokens = await context.ports.tokenRepo.findAll(
      context.ports.authContainer.getTokenMaster(),
    );
    return tokens.map(t => t.toAPI());
  },
  topics: async (_obj, args, context, _info) => {
    const topic = await context.ports.topicRepo.find(
      args.query,
      args.skip,
      args.limit,
    );
    return topic.map(t => t.toAPI());
  },
  topicTags: async (_obj, args, context, _info) => {
    return await context.ports.topicRepo.findTags(args.limit);
  },
};
