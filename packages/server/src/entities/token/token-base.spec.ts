import { ITokenBaseAPI, TokenBase } from "../../";
import { Copyable } from "../../utils";
import { applyMixins } from "../../utils";

describe("TokenBase", () => {
  class TokenBaseTest extends Copyable<TokenBaseTest>
    implements TokenBase<"general", TokenBaseTest> {
    readonly type: "general" = "general";

    toBaseAPI!: () => ITokenBaseAPI<"general">;

    constructor(
      readonly id: string,
      readonly key: string,
      readonly user: string,
      readonly date: Date,
    ) {
      super(TokenBaseTest);
    }
  }
  applyMixins(TokenBaseTest, [TokenBase]);

  describe("createTokenKey", () => {
    it("正常に生成出来るか", () => {
      expect(TokenBase.createTokenKey(() => "a")).not.toBe(
        TokenBase.createTokenKey(() => "b"),
      );
    });
  });

  describe("toBaseAPI", () => {
    const token = new TokenBaseTest("token", "key", "user", new Date(0));
    expect(token.toBaseAPI()).toEqual({
      id: "token",
      key: "key",
      date: new Date(0).toISOString(),
      type: "general",
    });
  });
});
