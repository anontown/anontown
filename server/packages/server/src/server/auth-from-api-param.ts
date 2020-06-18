import { IAuthToken, IAuthUser } from "../auth";
import { ITokenRepo, IUserRepo } from "../ports";

import { AtAuthError } from "../at-error";

import { isNullish } from "@kgtkr/utils";
import * as G from "../generated/graphql";

export async function tokenHeaderToToken(
  tokenRepo: ITokenRepo,
  apiParamToken: { id: string; key: string },
): Promise<IAuthToken> {
  const token = await tokenRepo.findOne(apiParamToken.id);
  const authToken = token.auth(apiParamToken.key);

  return authToken;
}

export async function authUserRequestToUser(
  userRepo: IUserRepo,
  apiParamUser: G.AuthUser,
): Promise<IAuthUser> {
  let id;
  if (!isNullish(apiParamUser.id) && isNullish(apiParamUser.sn)) {
    id = apiParamUser.id;
  } else if (isNullish(apiParamUser.id) && !isNullish(apiParamUser.sn)) {
    id = await userRepo.findID(apiParamUser.sn);
  } else {
    throw new AtAuthError("AuthUserはidかsnのどちらか片方を指定して下さい");
  }
  const user = await userRepo.findOne(id);
  const authUser = user.auth(apiParamUser.pass);

  return authUser;
}
