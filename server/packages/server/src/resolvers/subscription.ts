import * as op from "rxjs/operators";
import * as G from "../generated/graphql";
import { observableAsyncIterator } from "../utils";

export const subscription: G.SubscriptionResolvers = {
  resAdded: {
    subscribe: (_parent, args, context, _info) =>
      observableAsyncIterator(
        context.ports.resRepo.insertEvent.pipe(
          op.filter(x => x.res.topic === args.topic),
          op.map(x => ({
            count: x.count,
            res: x.res.toAPI(context.ports.authContainer.getTokenOrNull()),
          })),
        ),
      ),
    resolve: (x: any) => {
      // TODO: こうしないと動かない何故
      return x as any;
    },
  },
};
