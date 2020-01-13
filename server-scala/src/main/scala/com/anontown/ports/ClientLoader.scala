package com.anontown.ports
import com.anontown.entities.ClientId
import zio.IO
import com.anontown.AtError
import com.anontown.entities.Client

trait ClientLoader {
  def load(id: ClientId): IO[AtError, Client];
  def loadMany(ids: List[ClientId]): IO[AtError, List[Client]];
}

trait ClientLoaderComponent {
  val clientLoader: ClientLoader;
}
