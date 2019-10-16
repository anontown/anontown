.PHONY: bootstrap migrate shared build.all.server build.all.client build.all up stop rm restart.server restart.client watch.bff build.bff watch.client build.client build.client-icon watch.route build.route watch.server build.server

bootstrap:
	cd server && lerna bootstrap
	cd client && lerna bootstrap

migrate:
	cd server && DCDY_MODE=dev dcdy run --rm app npx lerna run migrate --scope @anontown/server

shared:
	./bin/shared.sh

build.all.server: shared
	cd server && lerna run build:dev --scope=@anontown/server --include-filtered-dependencies --stream

build.all.client: shared
	cd client && lerna run build:dev --scope=@anontown/bff --include-filtered-dependencies --stream

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
	cd client && lerna run build:watch --scope=@anontown/bff --stream

build.bff:
	cd client && lerna run build:dev --scope=@anontown/bff --stream

watch.client:
	cd client && lerna run build:watch --scope=@anontown/client --stream

build.client:
	cd client && lerna run build:dev --scope=@anontown/client --stream

build.client-icon:
	cd client && lerna run build:dev --scope=@anontown/client --stream

watch.route:
	cd client && lerna run build:watch --scope=@anontown/route --stream

build.route:
	cd client && lerna run build:dev --scope=@anontown/route --stream

watch.server: shared
	cd server && lerna run build:watch --scope=@anontown/server --stream

build.server: shared
	cd server && lerna run build:dev --scope=@anontown/server --stream
