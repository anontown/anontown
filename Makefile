.PHONY: bootstrap migrate shared build.all.server build.all.client build.all up stop rm restart.server restart.client watch.bff build.bff watch.client build.client build.client-icon watch.route build.route watch.server build.server lint.fix test

bootstrap:
	cd server && npm ci && npx lerna bootstrap --ci
	cd client && npm ci && npx lerna bootstrap --ci

migrate:
	cd server && DCDY_MODE=dev dcdy run --rm app npx lerna run migrate --scope @anontown/server

shared:
	./bin/shared.sh

build.all.server: shared
	cd server && npx lerna run build:dev --scope=@anontown/server --include-filtered-dependencies --stream

build.all.client: shared
	cd client && npx lerna run build:dev --scope=@anontown/bff --include-filtered-dependencies --stream

build.all: build.all.server build.all.client

up:
	DCDY_MODE=dev dcdy up

stop:
	DCDY_MODE=dev dcdy stop

rm:
	DCDY_MODE=dev dcdy rm

restart.server:
	DCDY_MODE=dev dcdy restart server

restart.client:
	DCDY_MODE=dev dcdy restart client

watch.bff:
	cd client && npx lerna run build:watch --scope=@anontown/bff --stream

build.bff:
	cd client && npx lerna run build:dev --scope=@anontown/bff --stream

watch.client:
	cd client && npx lerna run build:watch --scope=@anontown/client --stream

build.client:
	cd client && npx lerna run build:dev --scope=@anontown/client --stream

build.client-icon:
	cd client && npx lerna run build:dev --scope=@anontown/client --stream

watch.route:
	cd client && npx lerna run build:watch --scope=@anontown/route --stream

build.route:
	cd client && npx lerna run build:dev --scope=@anontown/route --stream

watch.server:
	cd server && npx lerna run build:watch --scope=@anontown/server --stream

build.server:
	cd server && npx lerna run build:dev --scope=@anontown/server --stream

lint.fix:
	cd server && npx lerna run lint:fix
	cd client && npx lerna run lint:fix

test:
	DCDY_MODE=test dcdy run --rm server npx lerna run test:io --scope @anontown/server --stream
