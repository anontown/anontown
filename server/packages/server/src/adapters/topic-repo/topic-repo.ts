import { isNullish, nullUnwrap } from "@kgtkr/utils";
import { AtNotFoundError } from "../../at-error";
import {
  ITagsAPI,
  Topic,
  TopicFork,
  TopicNormal,
  TopicOne,
} from "../../entities";
import * as G from "../../generated/graphql";
import { ITopicRepo } from "../../ports";
import * as P from "@prisma/client";
import * as Im from "immutable";
import { PrismaTransactionClient } from "../../prisma-client";
import { pipe } from "fp-ts/lib/pipeable";
import * as A from "fp-ts/lib/Array";
import * as Ord from "fp-ts/lib/Ord";
function toEntity(
  model: P.Topic & {
    tags: Array<P.TopicTag>;
    _count: {
      reses: number;
    } | null;
  },
): Topic {
  switch (model.type) {
    case "FORK":
      return new TopicFork(
        model.id,
        model.title,
        model.updatedAt,
        model.createdAt,
        model._count?.reses ?? 0,
        model.ageUpdatedAt,
        model.active,
        nullUnwrap(model.parentId),
      );
    case "NORMAL":
    case "ONE": {
      const tags = pipe(
        model.tags,
        A.sort(Ord.contramap<number, P.TopicTag>(x => x.order)(Ord.ordNumber)),
        A.map(({ tag }) => tag),
        xs => Im.List(xs),
      );

      switch (model.type) {
        case "NORMAL":
          return new TopicNormal(
            model.id,
            model.title,
            tags,
            nullUnwrap(model.description),
            model.updatedAt,
            model.createdAt,
            model._count?.reses ?? 0,
            model.ageUpdatedAt,
            model.active,
          );
        case "ONE":
          return new TopicOne(
            model.id,
            model.title,
            tags,
            nullUnwrap(model.description),
            model.updatedAt,
            model.createdAt,
            model._count?.reses ?? 0,
            model.ageUpdatedAt,
            model.active,
          );
      }
    }
  }
}

function fromEntity(entity: Topic): Omit<P.Prisma.TopicCreateInput, "id"> {
  const topicBase: Omit<P.Prisma.TopicCreateInput, "id" | "type"> = {
    title: entity.title,
    updatedAt: entity.update,
    createdAt: entity.date,
    ageUpdatedAt: entity.ageUpdate,
    active: entity.active,
  };

  switch (entity.type) {
    case "fork":
      return {
        ...topicBase,
        type: "ONE",
        parentId: entity.parent,
      };
    case "normal":
    case "one": {
      const topicSearchBase: Omit<P.Prisma.TopicCreateInput, "id" | "type"> = {
        ...topicBase,
        description: entity.text,
      };

      switch (entity.type) {
        case "normal":
          return {
            ...topicSearchBase,
            type: "NORMAL",
          };
        case "one":
          return {
            ...topicSearchBase,
            type: "ONE",
          };
      }
    }
  }
}

function tagsFromEntity(
  topic: TopicOne | TopicNormal,
): Array<P.Prisma.TopicTagCreateManyInput> {
  return topic.tags
    .toArray()
    .map<P.Prisma.TopicTagCreateManyInput>((tag, i) => ({
      topicId: topic.id,
      order: i,
      tag: tag,
    }));
}

export class TopicRepo implements ITopicRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async findOne(id: string): Promise<Topic> {
    const topic = await this.prisma.topic.findUnique({
      where: {
        id,
      },
      include: {
        tags: true,
        _count: {
          select: {
            reses: true,
          },
        },
      },
    });

    if (topic === null) {
      throw new AtNotFoundError("トピックが存在しません");
    }

    return toEntity(topic);
  }

  async findTags(limit: number): Promise<Array<ITagsAPI>> {
    if (limit === 0) {
      return [];
    }

    const tags = await this.prisma.topicTag.groupBy({
      by: ["tag"],
      _count: {
        tag: true,
      },
      orderBy: {
        _count: {
          tag: "desc",
        },
      },
      take: limit,
    });

    return tags.map(x => ({ name: x.tag, count: x._count.tag }));
  }

  async find(
    query: G.TopicQuery,
    skip: number,
    limit: number,
  ): Promise<Array<Topic>> {
    const filter: Array<P.Prisma.TopicWhereInput> = [];
    if (!isNullish(query.id)) {
      filter.push({
        id: {
          in: query.id,
        },
      });
    }

    if (!isNullish(query.title)) {
      for (const title of query.title.split(/\s/).filter(x => x.length !== 0)) {
        filter.push({
          title: {
            contains: title,
            mode: "insensitive",
          },
        });
      }
    }

    if (!isNullish(query.tags)) {
      for (const tag of query.tags) {
        filter.push({
          tags: {
            some: {
              tag,
            },
          },
        });
      }
    }

    if (query.activeOnly) {
      filter.push({
        active: true,
      });
    }

    if (!isNullish(query.parent)) {
      filter.push({
        parentId: query.parent,
      });
    }

    const topics = await this.prisma.topic.findMany({
      where: { AND: filter },
      orderBy: {
        ageUpdatedAt: "desc",
      },
      include: { tags: true, _count: { select: { reses: true } } },
      take: limit,
      skip: skip,
    });

    return topics.map(x => toEntity(x));
  }

  async cronTopicCheck(now: Date): Promise<void> {
    await this.prisma.topic.updateMany({
      where: {
        updatedAt: {
          lt: now,
        },
        active: true,
      },
      data: {
        active: false,
      },
    });
  }

  async insert(topic: Topic): Promise<void> {
    const model = fromEntity(topic);
    await this.prisma.topic.create({
      data: {
        ...model,
        id: topic.id,
      },
    });

    if (topic.type === "one" || topic.type === "normal") {
      await this.prisma.topicTag.createMany({
        data: tagsFromEntity(topic),
      });
    }
  }

  async update(topic: Topic): Promise<void> {
    const model = fromEntity(topic);

    await this.prisma.topic.update({
      where: { id: topic.id },
      data: model,
    });
    if (topic.type === "one" || topic.type === "normal") {
      await this.prisma.topicTag.deleteMany({
        where: { topicId: topic.id },
      });
      await this.prisma.topicTag.createMany({
        data: tagsFromEntity(topic),
      });
    }
  }
}
