import { AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster, IAuthUser } from "../../auth";
import { Token, TokenGeneral, TokenMaster } from "../../entities";
import { ITokenRepo } from "../../ports";
import * as P from "@prisma/client";
import { nullUnwrap } from "@kgtkr/utils";
import * as Im from "immutable";
import { PrismaTransactionClient } from "../../prisma-client";
import * as A from "fp-ts/lib/Array";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";

function toEntity(
  model: P.Token & {
    reqs: Array<P.TokenReq>;
  },
): Token {
  switch (model.type) {
    case "GENERAL":
      return new TokenGeneral(
        model.id,
        model.key,
        nullUnwrap(model.clientId),
        model.userId,
        pipe(
          model.reqs,
          A.sort(
            Ord.contramap<number, P.TokenReq>(x => x.expires.valueOf())(
              Ord.ordNumber,
            ),
          ),
          A.map(req => ({
            key: req.key,
            expireDate: req.expires,
            active: req.active,
          })),
          xs => Im.List(xs),
        ),
        model.createdAt,
      );
    case "MASTER":
      return new TokenMaster(
        model.id,
        model.key,
        model.userId,
        model.createdAt,
      );
  }
}

function fromEntity(token: Token): Omit<P.Prisma.TokenCreateInput, "id"> {
  const tokenBase: Omit<P.Prisma.TokenCreateInput, "id" | "type"> = {
    key: token.key,
    userId: token.user,
    createdAt: token.date,
  };

  switch (token.type) {
    case "general":
      return {
        ...tokenBase,
        type: "GENERAL",
        clientId: token.client,
      };
    case "master":
      return {
        ...tokenBase,
        type: "MASTER",
      };
  }
}

function reqsFromEntity(
  token: TokenGeneral,
): Array<P.Prisma.TokenReqCreateManyInput> {
  return token.req.toArray().map<P.Prisma.TokenReqCreateManyInput>(req => ({
    key: req.key,
    expires: req.expireDate,
    active: req.active,
    tokenId: token.id,
  }));
}

export class TokenRepo implements ITokenRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async findOne(id: string): Promise<Token> {
    const token = await this.prisma.token.findUnique({
      where: { id },
      include: {
        reqs: true,
      },
    });

    if (token === null) {
      throw new AtNotFoundError("トークンが存在しません");
    }

    return toEntity(token);
  }

  async findAll(authToken: IAuthTokenMaster): Promise<Array<Token>> {
    const models = await this.prisma.token.findMany({
      where: { userId: authToken.user },
      include: {
        reqs: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return models.map(t => toEntity(t));
  }

  async insert(token: Token): Promise<void> {
    await this.prisma.token.create({
      data: { ...fromEntity(token), id: token.id },
    });
    if (token.type === "general") {
      await this.prisma.tokenReq.createMany({ data: reqsFromEntity(token) });
    }
  }

  async update(token: Token): Promise<void> {
    await this.prisma.token.update({
      where: { id: token.id },
      data: fromEntity(token),
    });

    if (token.type === "general") {
      await this.prisma.tokenReq.deleteMany({ where: { tokenId: token.id } });
      await this.prisma.tokenReq.createMany({ data: reqsFromEntity(token) });
    }
  }

  async delClientToken(
    token: IAuthTokenMaster,
    clientID: string,
  ): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { userId: token.user, clientId: clientID },
    });
  }

  async delMasterToken(user: IAuthUser): Promise<void> {
    await this.prisma.token.deleteMany({
      where: { userId: user.id, type: "MASTER" },
    });
  }
}
