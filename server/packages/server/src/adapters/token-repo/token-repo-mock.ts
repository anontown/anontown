import { AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster, IAuthUser } from "../../auth";
import { Token } from "../../entities";
import { ITokenRepo } from "../../ports";
import { fromToken, ITokenDB, toToken } from "./itoken-db";

export class TokenRepoMock implements ITokenRepo {
  private tokens: Array<ITokenDB> = [];

  async findOne(id: string): Promise<Token> {
    const token = this.tokens.find(x => x._id.toHexString() === id);
    if (token === undefined) {
      throw new AtNotFoundError("トークンが存在しません");
    }

    return toToken(token);
  }

  async findAll(authToken: IAuthTokenMaster): Promise<Array<Token>> {
    const tokens = this.tokens
      .filter(x => x.user.toHexString() === authToken.user)
      .sort((a, b) => b.date.valueOf() - a.date.valueOf());

    return tokens.map(t => toToken(t));
  }

  async insert(token: Token): Promise<void> {
    this.tokens.push(fromToken(token));
  }

  async update(token: Token): Promise<void> {
    this.tokens[
      this.tokens.findIndex(x => x._id.toHexString() === token.id)
    ] = fromToken(token);
  }

  async delClientToken(
    token: IAuthTokenMaster,
    clientID: string,
  ): Promise<void> {
    this.tokens = this.tokens.filter(
      x =>
        !(
          x.user.toHexString() === token.user &&
          x.type === "general" &&
          x.client.toHexString() === clientID
        ),
    );
  }

  async delMasterToken(user: IAuthUser): Promise<void> {
    this.tokens = this.tokens.filter(
      x => !(x.user.toHexString() === user.id && x.type === "master"),
    );
  }
}
