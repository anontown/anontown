# Anontown

[![Build Status](https://travis-ci.org/anontown/anontown.svg?branch=develop)](https://travis-ci.org/anontown/anontown)
[![Netlify Status](https://api.netlify.com/api/v1/badges/a8646346-64ec-4f9e-a2c3-ca6c97000fab/deploy-status)](https://app.netlify.com/sites/anontown/deploys)
[![Netlify Status](https://api.netlify.com/api/v1/badges/5114ddeb-bf24-40e2-bb0c-c55b2fa23a3d/deploy-status)](https://app.netlify.com/sites/document/deploys)


## Develop
```sh
$ npm i
$ npx lerna bootstrap
$ cp .env.sample .env
# edit .env
$ docker-compose -f docker-compose.dev.yml up
$ npx lerna exec --scope @anontown/server -- npm run build
$ npx lerna exec --scope @anontown/server -- npm run migrate
$ npm run start:dev
$ lerna exec --scope @anontown/client -- npm start
```

## .envの編集
DB_USERとDB_PASSは消して大丈夫です(セキュリティが心配な場合はmongodbコンテナに入りユーザーを作成して設定して下さい)  
SALT_PASS、SALT_HASH、SALT_TOKEN、SALT_TOKEN_REQを設定します。これはどのような文字列でも構いませんが、推測されないように出来るだけ長くし、記号や数字、アルファベット等を組み合わせて下さい。特にSALT_HASHはとても重要です。これが漏れると匿名掲示板ではなくなってしまいます。  
RECAPTCHA_SITE_KET、RECAPTCHA_SECRET_KETはGoogleのサイトでキーを取得し設定しましょう。  

## Test
```sh
docker-compose -f docker-compose.test.yml run --rm app npx lerna exec --scope @anontown/server -- npm run test:io
```

## 公式サーバー
https://anontown.com/  


## 寄付
サーバーの維持費などに使います。

![](kyash.png)
