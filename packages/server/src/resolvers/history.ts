import * as G from "../generated/graphql";
import { getTopic } from "../usecases";

export const history: G.HistoryResolvers = {
  topic: async (history, _args, context, _info) => {
    const topic = await getTopic({ id: history.topicID }, context.ports);
    if (topic.type !== "normal") {
      throw new Error();
    }
    return topic;
  },
};
