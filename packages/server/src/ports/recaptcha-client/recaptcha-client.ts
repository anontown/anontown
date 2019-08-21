export interface IRecaptchaClient {
  verify(apiParamRecaptcha: string): Promise<void>;
}
