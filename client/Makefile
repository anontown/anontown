.PHONY: noop
noop:
	echo

.PHONY: build-watch
build-watch:
	npx lerna run build:watch --stream --scope=@anontown/client

.PHONY: build-watch-bff
build-watch-bff:
	npx lerna run build:watch --stream --scope=@anontown/bff

.PHONY: codegen-watch
codegen-watch:
	npx lerna run codegen:watch --parallel --scope=@anontown/client --include-filtered-dependencies

.PHONY: lint
lint:
	npm run lint

.PHONY: lint-fix
lint-fix:
	npm run lint:fix

.PHONY: lint-quiet
lint-quiet:
	npm run lint:quiet

.PHONY: start
start:
	npx lerna run start --scope @anontown/bff --stream

.PHONY: start-watch
start-watch:
	$(MAKE) codegen-watch & \
	$(MAKE) build-watch & \
	$(MAKE) build-watch-bff & \
	npx lerna run start:watch --scope @anontown/bff --stream

.PHONY: start-watch-bff-less
start-watch-bff-less:
	$(MAKE) codegen-watch & \
	npx lerna run build-and-start:watch --scope @anontown/client --stream
