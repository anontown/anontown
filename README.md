# Anontown

## Develop
```sh
$ npm i
$ npx lerna bootstrap
$ cp .env.sample .env
# edit .env
$ docker-compose -f docker-compose.dev.yml up
$ npx lerna exec --scope @anontown/server -- npm run build
$ npx lerna exec --scope @anontown/server -- npm run migrate
$ ./start-dev.sh
$ lerna exec --scope @anontown/client -- npm start
```