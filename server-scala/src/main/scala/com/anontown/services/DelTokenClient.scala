package com.anontown.services

import cats.tagless.finalAlg
import cats.data.EitherT
import com.anontown.AtError
import cats.Monad
import com.anontown.ports.ClientRepositoryAlg
import com.anontown.ports.AuthContainerAlg
import com.anontown.entities.client.ClientId
import com.anontown.ports.TokenRepositoryAlg

@finalAlg
trait DelTokenClientAlg[F[_]] {
  def run(client: String): EitherT[F, AtError, Unit];
}

class DelTokenClient[F[_]: Monad: ClientRepositoryAlg: TokenRepositoryAlg: AuthContainerAlg]
    extends DelTokenClientAlg[F] {
  def run(client: String): EitherT[F, AtError, Unit] = {
    for {
      client <- ClientRepositoryAlg[F].findOne(ClientId(client))
      auth <- AuthContainerAlg[F].getTokenMaster()
      _ <- TokenRepositoryAlg[F].delClientToken(auth, client.id)
    } yield ()
  }
}

/*
  delTokenClient: async (_obj, args, context, _info) => {
    const client = await context.ports.clientRepo.findOne(args.client);
    await context.ports.tokenRepo.delClientToken(
      context.ports.authContainer.getTokenMaster(),
      client.id,
    );
    return null;
  },
 */
