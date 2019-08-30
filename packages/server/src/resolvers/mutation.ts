import { isNullish, nullToUndefined } from "@kgtkr/utils";
import { fromNullable, some } from "fp-ts/lib/Option";
import { AtNotFoundError } from "../at-error";
import {
  Client,
  Profile,
  ResNormal,
  Storage,
  TokenGeneral,
  TokenMaster,
  TopicFork,
  TopicNormal,
  TopicOne,
  User,
} from "../entities";
import * as formatter from "../formatter";
import * as G from "../generated/graphql";
import * as authFromApiParam from "../server/auth-from-api-param";

export const mutation: G.MutationResolvers = {
  createUser: async (_obj, args, context, _info) => {
    await context.recaptcha.verify(args.recaptcha);

    const user = User.create(
      context.objectIdGenerator,
      args.sn,
      args.pass,
      context.clock.now(),
    );
    await context.userRepo.insert(user);

    const token = TokenMaster.create(
      context.objectIdGenerator,
      user.auth(args.pass),
      context.clock.now(),
      context.safeIdGenerator,
    );
    await context.tokenRepo.insert(token);

    return { user: user.toAPI(), token: token.toAPI() };
  },
  updateUser: async (_obj, args, context, _info) => {
    const authUser = await authFromApiParam.user(context.userRepo, args.auth);
    const user = await context.userRepo.findOne(authUser.id);
    const newUser = user.change(
      authUser,
      nullToUndefined(args.pass),
      nullToUndefined(args.sn),
    );
    await context.userRepo.update(newUser);
    await context.tokenRepo.delMasterToken(authUser);

    const token = TokenMaster.create(
      context.objectIdGenerator,
      authUser,
      context.clock.now(),
      context.safeIdGenerator,
    );
    await context.tokenRepo.insert(token);
    return { user: newUser.toAPI(), token: token.toAPI() };
  },
  createClient: async (_obj, args, context, _info) => {
    const client = Client.create(
      context.objectIdGenerator,
      context.authContainer.getTokenMaster(),
      args.name,
      args.url,
      context.clock.now(),
    );
    await context.clientRepo.insert(client);
    context.logger.info(
      formatter.mutation(context.ipContainer, "clients", client.id),
    );
    return client.toAPI(some(context.authContainer.getTokenMaster()));
  },
  updateClient: async (_obj, args, context, _info) => {
    const client = await context.clientRepo.findOne(args.id);
    const newClient = client.changeData(
      context.authContainer.getTokenMaster(),
      nullToUndefined(args.name),
      nullToUndefined(args.url),
      context.clock.now(),
    );
    await context.clientRepo.update(newClient);
    context.logger.info(
      formatter.mutation(context.ipContainer, "clients", client.id),
    );
    return newClient.toAPI(some(context.authContainer.getTokenMaster()));
  },
  createProfile: async (_obj, args, context, _info) => {
    const profile = Profile.create(
      context.objectIdGenerator,
      context.authContainer.getToken(),
      args.name,
      args.text,
      args.sn,
      context.clock.now(),
    );
    await context.profileRepo.insert(profile);
    context.logger.info(
      formatter.mutation(context.ipContainer, "profiles", profile.id),
    );
    return profile.toAPI(some(context.authContainer.getToken()));
  },
  updateProfile: async (_obj, args, context, _info: any) => {
    const profile = await context.profileRepo.findOne(args.id);
    const newProfile = profile.changeData(
      context.authContainer.getToken(),
      nullToUndefined(args.name),
      nullToUndefined(args.text),
      nullToUndefined(args.sn),
      context.clock.now(),
    );
    await context.profileRepo.update(newProfile);
    context.logger.info(
      formatter.mutation(context.ipContainer, "profiles", newProfile.id),
    );
    return newProfile.toAPI(some(context.authContainer.getToken()));
  },
  createRes: async (_obj, args, context, _info) => {
    const [topic, user, reply, profile] = await Promise.all([
      context.topicRepo.findOne(args.topic),
      context.userRepo.findOne(context.authContainer.getToken().user),
      !isNullish(args.reply)
        ? context.resRepo.findOne(args.reply)
        : Promise.resolve(null),
      !isNullish(args.profile)
        ? context.profileRepo.findOne(args.profile)
        : Promise.resolve(null),
    ]);

    const { res, user: newUser, topic: newTopic } = ResNormal.create(
      context.objectIdGenerator,
      topic,
      user,
      context.authContainer.getToken(),
      fromNullable(args.name),
      args.text,
      fromNullable(reply),
      fromNullable(profile),
      args.age,
      context.clock.now(),
    );

    await Promise.all([
      context.resRepo.insert(res),
      context.topicRepo.update(newTopic),
      context.userRepo.update(newUser),
    ]);

    context.logger.info(
      formatter.mutation(context.ipContainer, "reses", res.id),
    );
    const api = res.toAPI(some(context.authContainer.getToken()));
    if (api.type !== "normal") {
      throw new Error();
    }
    return api;
  },
  voteRes: async (_obj, args, context, _info) => {
    if (args.type === "cv") {
      const [res, user] = await Promise.all([
        context.resRepo.findOne(args.res),
        context.userRepo.findOne(context.authContainer.getToken().user),
      ]);

      // レスを書き込んだユーザー
      const resUser = await context.userRepo.findOne(res.user);

      const { res: newRes, resUser: newResUser } = res.cv(
        resUser,
        user,
        context.authContainer.getToken(),
      );

      await Promise.all([
        context.resRepo.update(newRes),
        context.userRepo.update(newResUser),
        context.userRepo.update(user),
      ]);

      return newRes.toAPI(some(context.authContainer.getToken()));
    } else {
      const [res, user] = await Promise.all([
        context.resRepo.findOne(args.res),
        context.userRepo.findOne(context.authContainer.getToken().user),
      ]);

      // レスを書き込んだユーザー
      const resUser = await context.userRepo.findOne(res.user);

      const { res: newRes, resUser: newResUser } = res.v(
        resUser,
        user,
        args.type,
        context.authContainer.getToken(),
      );

      await Promise.all([
        context.resRepo.update(newRes),
        context.userRepo.update(newResUser),
        context.userRepo.update(user),
      ]);

      return newRes.toAPI(some(context.authContainer.getToken()));
    }
  },
  delRes: async (_obj, args, context, _info) => {
    const res = await context.resRepo.findOne(args.res);

    if (res.type !== "normal") {
      throw new AtNotFoundError("レスが見つかりません");
    }

    // レスを書き込んだユーザー
    const resUser = await context.userRepo.findOne(res.user);

    const { res: newRes, resUser: newResUser } = res.del(
      resUser,
      context.authContainer.getToken(),
    );

    await Promise.all([
      context.resRepo.update(newRes),
      context.userRepo.update(newResUser),
    ]);

    const api = newRes.toAPI(some(context.authContainer.getToken()));
    if (api.type !== "delete") {
      throw new Error();
    }
    return api;
  },
  setStorage: async (_obj, args, context, _info) => {
    const storage = Storage.create(
      context.authContainer.getToken(),
      args.key,
      args.value,
    );
    await context.storageRepo.save(storage);
    return storage.toAPI(context.authContainer.getToken());
  },
  delStorage: async (_obj, args, context, _info) => {
    const storage = await context.storageRepo.findOneKey(
      context.authContainer.getToken(),
      args.key,
    );
    await context.storageRepo.del(storage);
    return null;
  },
  delTokenClient: async (_obj, args, context, _info) => {
    const client = await context.clientRepo.findOne(args.client);
    await context.tokenRepo.delClientToken(
      context.authContainer.getTokenMaster(),
      client.id,
    );
    return null;
  },
  createTokenGeneral: async (_obj, args, context, _info) => {
    const client = await context.clientRepo.findOne(args.client);
    const token = TokenGeneral.create(
      context.objectIdGenerator,
      context.authContainer.getTokenMaster(),
      client,
      context.clock.now(),
      context.safeIdGenerator,
    );

    const { req, token: newToken } = token.createReq(
      context.clock.now(),
      context.safeIdGenerator,
    );

    await context.tokenRepo.insert(newToken);

    return {
      token: token.toAPI(),
      req,
    };
  },
  createTokenMaster: async (_obj, args, context, _info) => {
    const authUser = await authFromApiParam.user(context.userRepo, args.auth);
    const token = TokenMaster.create(
      context.objectIdGenerator,
      authUser,
      context.clock.now(),
      context.safeIdGenerator,
    );
    await context.tokenRepo.insert(token);

    return token.toAPI();
  },
  authTokenReq: async (_obj, args, context, _info) => {
    const token = await context.tokenRepo.findOne(args.id);
    if (token.type !== "general") {
      throw new AtNotFoundError("トークンが見つかりません");
    }
    token.authReq(args.key, context.clock.now());
    return token.toAPI();
  },
  createTokenReq: async (_obj, _args, context, _info) => {
    const token = await context.tokenRepo.findOne(
      context.authContainer.getToken().id,
    );
    if (token.type !== "general") {
      throw new AtNotFoundError("トークンが見つかりません");
    }
    const { req, token: newToken } = token.createReq(
      context.clock.now(),
      context.safeIdGenerator,
    );

    await context.tokenRepo.update(newToken);

    return req;
  },
  createTopicNormal: async (_obj, args, context, _info) => {
    const user = await context.userRepo.findOne(
      context.authContainer.getToken().user,
    );
    const create = TopicNormal.create(
      context.objectIdGenerator,
      args.title,
      args.tags,
      args.text,
      user,
      context.authContainer.getToken(),
      context.clock.now(),
    );

    await context.topicRepo.insert(create.topic);
    await Promise.all([
      context.userRepo.update(create.user),
      context.resRepo.insert(create.res),
      context.historyRepo.insert(create.history),
    ]);
    context.logger.info(
      formatter.mutation(context.ipContainer, "topics", create.topic.id),
    );
    context.logger.info(
      formatter.mutation(context.ipContainer, "reses", create.res.id),
    );
    context.logger.info(
      formatter.mutation(context.ipContainer, "histories", create.history.id),
    );
    return create.topic.toAPI();
  },
  createTopicOne: async (_obj, args, context, _info) => {
    const user = await context.userRepo.findOne(
      context.authContainer.getToken().user,
    );
    const create = TopicOne.create(
      context.objectIdGenerator,
      args.title,
      args.tags,
      args.text,
      user,
      context.authContainer.getToken(),
      context.clock.now(),
    );

    await context.topicRepo.insert(create.topic);
    await Promise.all([
      context.userRepo.update(create.user),
      context.resRepo.insert(create.res),
    ]);

    context.logger.info(
      formatter.mutation(context.ipContainer, "topics", create.topic.id),
    );
    context.logger.info(
      formatter.mutation(context.ipContainer, "reses", create.res.id),
    );

    return create.topic.toAPI();
  },
  createTopicFork: async (_obj, args, context, _info) => {
    const user = await context.userRepo.findOne(
      context.authContainer.getToken().user,
    );
    const parent = await context.topicRepo.findOne(args.parent);

    if (parent.type !== "normal") {
      throw new AtNotFoundError("トピックが見つかりません");
    }

    const create = TopicFork.create(
      context.objectIdGenerator,
      args.title,
      parent,
      user,
      context.authContainer.getToken(),
      context.clock.now(),
    );

    await context.topicRepo.insert(create.topic);
    await context.topicRepo.update(create.parent);
    await Promise.all([
      context.userRepo.update(create.user),
      context.resRepo.insert(create.res),
      context.resRepo.insert(create.resParent),
    ]);

    context.logger.info(
      formatter.mutation(context.ipContainer, "topics", create.topic.id),
    );
    context.logger.info(
      formatter.mutation(context.ipContainer, "reses", create.res.id),
    );
    context.logger.info(
      formatter.mutation(context.ipContainer, "reses", create.resParent.id),
    );

    return create.topic.toAPI();
  },
  updateTopic: async (_obj, args, context, _info) => {
    const [topic, user] = await Promise.all([
      context.topicRepo.findOne(args.id),
      context.userRepo.findOne(context.authContainer.getToken().user),
    ]);

    if (topic.type !== "normal") {
      throw new AtNotFoundError("トピックが見つかりません");
    }

    const val = topic.changeData(
      context.objectIdGenerator,
      user,
      context.authContainer.getToken(),
      nullToUndefined(args.title),
      nullToUndefined(args.tags),
      nullToUndefined(args.text),
      context.clock.now(),
    );

    await Promise.all([
      context.resRepo.insert(val.res),
      context.historyRepo.insert(val.history),
      context.topicRepo.update(val.topic),
      context.userRepo.update(val.user),
    ]);

    context.logger.info(
      formatter.mutation(context.ipContainer, "reses", val.res.id),
    );
    context.logger.info(
      formatter.mutation(context.ipContainer, "histories", val.history.id),
    );

    return topic.toAPI();
  },
};
