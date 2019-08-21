import * as request from "request";
import { AtCaptchaError } from "../../at-error";
import { Config } from "../../config";
import { IRecaptchaClient } from "../../ports";

export class RecaptchaClient implements IRecaptchaClient {
  async verify(apiParamRecaptcha: string): Promise<void> {
    const result = await new Promise<string>((resolve, reject) => {
      request.post(
        "https://www.google.com/recaptcha/api/siteverify",
        {
          form: {
            secret: Config.recaptcha.secretKey,
            response: apiParamRecaptcha,
          },
        },
        (err, _res, body: string) => {
          if (err) {
            reject("キャプチャAPIでエラー");
          } else {
            resolve(body);
          }
        },
      );
    });

    if (!JSON.parse(result).success) {
      throw new AtCaptchaError();
    }
  }
}
