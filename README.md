# Anontown

## Develop

```sh
$ make bootstrap
$ make build.all
$ cp .env.sample .env
# edit .env
$ make migrate
$ make up
```

edit server
```sh
$ make watch.server
$ make restart.server
```

edit client
```sh
$ make watch.client
```

## .env の編集

`SALT_PASS`、`SALT_HASH`、`SALT_TOKEN`、`SALT_TOKEN_REQ`を設定します。これはどのような文字列でも構いませんが、推測されないように出来るだけ長くし、記号や数字、アルファベット等を組み合わせて下さい。特に`SALT_HASH`はとても重要です。これが漏れると匿名掲示板ではなくなってしまいます。  
`RECAPTCHA_SITE_KET`、`RECAPTCHA_SECRET_KET`はGoogleのサイトでキーを取得し設定しましょう。

## Test

```sh
make test
```

## Lint Fix

```sh
make lint.fix
```

## npm scripts
(メモ段階)

* build: ビルド
* build:watch: ウォッチモード
* start: サーバー起動。ビルドはしない
* loc: 行数カウント
* lint: lintチェック
* lint:fix: lintのチェックとフォーマット
* test: テスト実行

## 公式サーバー

https://anontown.com/

## 寄付

サーバーの維持費などに使います。

![](kyash.png)
