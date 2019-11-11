package net.kgtkr.anontown.entities;

import java.time.OffsetDateTime;

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
    lv: String,
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
