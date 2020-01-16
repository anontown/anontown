package com.anontown.ports
import zio.IO
import com.anontown.AtError
import com.anontown.entities.client.{Client, ClientId}

trait ClientLoader {
  def load(id: ClientId): IO[AtError, Client];
  def loadMany(ids: List[ClientId]): IO[AtError, List[Client]];
}

trait ClientLoaderComponent {
  val clientLoader: ClientLoader;
}
