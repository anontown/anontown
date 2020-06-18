.PHONY: noop
noop:
	echo

.PHONY: lint
lint:
	npm run lint

.PHONY: lint-fix
lint-fix:
	npm run lint:fix

.PHONY: lint-quiet
lint-quiet:
	npm run lint:quiet

.PHONY: migrate
migrate: wait
	npx lerna run migrate --scope @anontown/server --stream

.PHONY: render-schema
render-schema:
	cd packages/server
	npm run -s render-schema

.PHONY: start
start: wait
	npx lerna run start --scope @anontown/server --stream

.PHONY: build-watch
build-watch:
	npx lerna run build:watch --stream --scope @anontown/server

.PHONY: codegen-watch
codegen-watch:
	npx lerna run codegen:watch --parallel --scope @anontown/server --include-filtered-dependencies

.PHONY: start-watch
start-watch: wait
	$(MAKE) codegen-watch & \
	$(MAKE) build-watch & \
	npx lerna run start:watch --scope @anontown/server --stream


.PHONY: test
test:
	npx lerna run test --scope @anontown/server --stream

.PHONY: wait
wait:
	dockerize -wait tcp://$$ES_HOST -wait tcp://$$REDIS_HOST -wait tcp://$$MONGO_HOST -timeout 60s

