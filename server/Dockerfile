FROM alpine:3.11.5 as dockerize

WORKDIR /home

RUN apk add --no-cache openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

FROM node:10.15.3 as base

WORKDIR /home

COPY --from=dockerize /home/dockerize /usr/local/bin/

COPY package.json package-lock.json ./
RUN npm ci --no-progress

COPY lerna.json ./
COPY packages/server/package.json packages/server/package-lock.json ./packages/server/
RUN npx lerna bootstrap --ci --no-progress

COPY schema.gql ./schema.gql
COPY packages ./packages
RUN npx lerna run codegen --scope @anontown/server \
  && npx lerna run build --scope @anontown/server --include-filtered-dependencies

COPY bin/ bin/

CMD ./bin/start.sh

FROM base as dev
COPY bin-dev/ bin/

FROM base

