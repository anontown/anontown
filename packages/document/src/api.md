# API
## 注意
仕様がとても不安定で予告なしの破壊的変更が定期的にあります。
またドキュメントもまだ整備できていません。

## 認証
クライアント登録して、`https://anontown.com/auth?client=id`にリダイレクトすれば登録しておいたURLに`/?id=id&key=key`がついてコールバックされます。
これはtoken requestなので`/token/find/reqAPI`を使うことでトークンを取得することが出来ます。

## API仕様
npmに`@anontown/api-types`と`@anontown/api-client`パッケージがあるのでそれ見たら何となく分かるかもしれません。
TypeScriptなので型情報もありますし、適当に予想して使ってみてください。
そのうちドキュメント整備します。