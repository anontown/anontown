import io.circe.Json;

trait AtError {
  val code: String;
  val message: String;
  val data: Json = Json.Null;
}

final case class AtServerError() extends AtError {
  val code = "server";
  val message = "サーバー内部エラー";
}

final case class AtCaptchaError() extends AtError {
  val code = "captcha";
  val message = "キャプチャ認証に失敗";
}

final case class AtParamsErrorItem(field: String, message: String) {
  val json: Json = Json.obj(
    "message" -> Json.fromString(message),
    "data" -> Json.obj("field" -> Json.fromString(field))
  )
}

final case class AtParamsError(items: List[AtParamsErrorItem]) extends AtError {
  val code = "params";
  val message = "パラメーターが不正です";
  override val data = Json.arr(items.map(_.json): _*);
}

final case class AtRightError(message: String) extends AtError {
  val code = "right";
}

final case class AtConflictError(message: String) extends AtError {
  val code = "conflict";
}

final case class AtPrerequisiteError(message: String) extends AtError {
  val code = "prerequisite";
}

final case class AtTokenAuthError() extends AtError {
  val code = "token_auth";
  val message = "認証に失敗しました"
}

final case class AtAuthError(message: String) extends AtError {
  val code = "auth";
}

final case class AtUserAuthError() extends AtError {
  val code = "user_auth";
  val message = "認証に失敗しました"
}

final case class AtNotFoundError(message: String) extends AtError {
  val code = "not_found";
}
