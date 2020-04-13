import { ObjectID } from "mongodb";
import { AtNotFoundError } from "../../at-error";
import { IAuthTokenMaster, IAuthUser } from "../../auth";
import { Mongo } from "../../db";
import { Token } from "../../entities";
import { ITokenRepo } from "../../ports";
import { fromToken, ITokenDB, toToken } from "./itoken-db";

export class TokenRepo implements ITokenRepo {
  async findOne(id: string): Promise<Token> {
    const db = await Mongo();
    const token: ITokenDB | null = await db
      .collection("tokens")
      .findOne({ _id: new ObjectID(id) });
    if (token === null) {
      throw new AtNotFoundError("トークンが存在しません");
    }

    return toToken(token);
  }

  async findAll(authToken: IAuthTokenMaster): Promise<Array<Token>> {
    const db = await Mongo();
    const tokens: Array<ITokenDB> = await db
      .collection("tokens")
      .find({ user: new ObjectID(authToken.user) })
      .sort({ date: -1 })
      .toArray();

    return tokens.map(t => toToken(t));
  }

  async insert(token: Token): Promise<void> {
    const db = await Mongo();
    await db.collection("tokens").insertOne(fromToken(token));
  }

  async update(token: Token): Promise<void> {
    const db = await Mongo();
    await db
      .collection("tokens")
      .replaceOne({ _id: new ObjectID(token.id) }, fromToken(token));
  }

  async delClientToken(
    token: IAuthTokenMaster,
    clientID: string,
  ): Promise<void> {
    const db = await Mongo();
    await db.collection("tokens").deleteMany({
      user: new ObjectID(token.user),
      client: new ObjectID(clientID),
    });
  }

  async delMasterToken(user: IAuthUser): Promise<void> {
    const db = await Mongo();
    await db
      .collection("tokens")
      .deleteMany({ user: new ObjectID(user.id), type: "master" });
  }
}
