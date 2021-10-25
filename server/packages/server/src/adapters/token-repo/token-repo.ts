import { AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster, IAuthUser } from "../../auth";
import { Token, TokenGeneral, TokenMaster } from "../../entities";
import { ITokenRepo } from "../../ports";
import * as P from "@prisma/client";
import { nullUnwrap } from "@kgtkr/utils";
import * as Im from "immutable";
import { PrismaTransactionClient } from "../../prisma-client";

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
        Im.List(
          model.reqs.map(req => ({
            key: req.key,
            expireDate: req.expires,
            active: req.active,
          })),
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
  switch (token.type) {
    case "general":
      return {
        key: token.key,
        userId: token.user,
        createdAt: token.date,
        type: "GENERAL",
        clientId: token.client,
        reqs: {
          create: token.req.toArray().map(req => ({
            key: req.key,
            expires: req.expireDate,
            active: req.active,
          })),
        },
      };
    case "master":
      return {
        key: token.key,
        userId: token.user,
        createdAt: token.date,
        type: "MASTER",
      };
  }
}
export class TokenRepo implements ITokenRepo {
  constructor(private prisma: PrismaTransactionClient) {}

  async findOne(id: string): Promise<Token> {
    const token = await this.prisma.token.findUnique({
      where: { id },
      include: {
        reqs: {
          orderBy: { expires: "asc" },
        },
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
        reqs: {
          orderBy: { expires: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return models.map(t => toEntity(t));
  }

  async insert(token: Token): Promise<void> {
    await this.prisma.token.create({
      data: { ...fromEntity(token), id: token.id },
    });
  }

  async update(token: Token): Promise<void> {
    if (token.type === "general") {
      await this.prisma.tokenReq.deleteMany({ where: { tokenId: token.id } });
    }
    await this.prisma.token.update({
      where: { id: token.id },
      data: fromEntity(token),
    });
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
