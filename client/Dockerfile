FROM node:10.15.3 as base

WORKDIR /home

COPY package.json package-lock.json ./
RUN npm ci --no-progress

COPY lerna.json ./
COPY packages/bff/package.json packages/bff/package-lock.json ./packages/bff/
COPY packages/client/package.json packages/client/package-lock.json ./packages/client/
COPY packages/client-icon/package.json packages/client-icon/package-lock.json ./packages/client-icon/
COPY packages/icon/package.json ./packages/icon/
COPY packages/route/package.json packages/route/package-lock.json ./packages/route/
COPY packages/types/package.json ./packages/types/
RUN npx lerna bootstrap --ci --no-progress

COPY schema.json ./
COPY packages ./packages
RUN npx lerna run codegen --scope @anontown/client \
  && npx lerna run build --scope @anontown/client --include-filtered-dependencies \
  && npx lerna run build --scope @anontown/bff --include-filtered-dependencies

COPY bin/ bin/

FROM base as dev
COPY bin-dev/ bin/

FROM base
CMD ./bin/start.sh
