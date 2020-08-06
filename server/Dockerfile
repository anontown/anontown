FROM alpine:3.11.5 as dockerize

WORKDIR /home

RUN apk add --no-cache openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

FROM node:12.18.3-alpine as base

WORKDIR /home

COPY --from=dockerize /home/dockerize /usr/local/bin/

COPY package.json package-lock.json ./
RUN npm ci --no-progress

COPY lerna.json ./
COPY packages/server/package.json packages/server/package-lock.json ./packages/server/
RUN npx lerna bootstrap --ci --no-progress

COPY schema.gql .eslintignore .eslintrc.js .prettierrc ./
COPY packages ./packages
RUN npx lerna run codegen --scope @anontown/server --include-filtered-dependencies \
  && npm run build --scope @anontown/server

COPY bin ./bin

FROM base as dev

COPY restart-dummy ./restart-dummy
CMD ./bin/start-watch.sh

FROM base

CMD ./bin/start.sh
