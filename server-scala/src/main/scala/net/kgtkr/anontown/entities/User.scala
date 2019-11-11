package net.kgtkr.anontown.entities;

import java.time.OffsetDateTime;
import net.kgtkr.anontown.ports.ObjectIdGenerator
import net.kgtkr.anontown.ports.Clock
import net.kgtkr.anontown.utils;
import net.kgtkr.anontown.Config

final case class UserAPI(id: String, sn: String);

final case class ResWaitCount(
    m10: Int,
    m30: Int,
    h1: Int,
    h6: Int,
    h12: Int,
    d1: Int
);

final case class ResWait(last: OffsetDateTime, count: ResWaitCount)

final case class User(
    id: String,
    sn: String,
    pass: String,
    lv: Int,
    resWait: ResWait,
    lastTopic: OffsetDateTime,
    date: OffsetDateTime,
    // 毎日リセットされ、特殊動作をすると増えるポイント
    point: Int,
    lastOneTopic: OffsetDateTime
) {
  def toAPI(): UserAPI = {
    UserAPI(id = this.id, sn = this.sn);
  }
}

object User {
  def create(
      sn: String,
      pass: String,
      ports: ObjectIdGenerator with Clock
  ): User = {
    User(
      id = ports.generateObjectId(),
      sn = sn,
      pass = utils.hash(pass + Config.config.salt.pass),
      lv = 1,
      resWait = ResWait(
        last = ports.now(),
        count = ResWaitCount(m10 = 0, m30 = 0, h1 = 0, h6 = 0, h12 = 0, d1 = 0)
      ),
      lastTopic = ports.now(),
      date = ports.now(),
      point = 0,
      lastOneTopic = ports.now()
    );
  }
}
