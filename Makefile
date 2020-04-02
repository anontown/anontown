.PHONY: noop bootstrap migrate build.all.server build.all.client build.all up stop rm restart.server restart.client watch.bff build.bff watch.client build.client build.client-icon watch.route build.route watch.server build.server lint.fix test build.doc build.docker update-schema

noop:
	echo

bootstrap:
	cd server && npm ci && npx lerna bootstrap --ci
	cd client && npm ci && npx lerna bootstrap --ci
	cd doc && npm ci

migrate:
	DCDY_MODE=dev dcdy run --rm server npx lerna run migrate --scope @anontown/server

build.docker:
	DCDY_MODE=dev dcdy build

build.all.server:
	cd server && npx lerna run build:dev --scope=@anontown/server --include-filtered-dependencies --stream

build.all.client:
	cd client && npx lerna run build:dev --scope=@anontown/bff --include-filtered-dependencies --stream


build.all.doc:
	cd doc && npm run build

build.all: build.all.server build.all.client build.all.doc

up:
	DCDY_MODE=dev dcdy up

stop:
	DCDY_MODE=dev dcdy stop

rm:
	DCDY_MODE=dev dcdy rm -f

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

build.doc:
	cd doc && npm run build

lint.fix:
	cd server && npx lerna run lint:fix
	cd client && npx lerna run lint:fix

test:
	DCDY_MODE=test dcdy run --rm server npx lerna run test:io --scope @anontown/server --stream

update-schema:
	docker build -t server server
	docker run --rm server ./render-schema.sh > client/schema.json
