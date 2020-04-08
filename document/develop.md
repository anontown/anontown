# 開発
[環境構築](./environment.md)が必要です。

## 起動
ソースを変更すると自動で再コンパイルとサーバーの再起動が行われます。

```sh
$ cp -R env.sample env
# edit
$ make serve
# open localhost:3000
```

## ボリューム
`/data/anontown`に永続化されています。
