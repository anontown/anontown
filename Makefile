.PHONY: noop
noop:
	echo

.PHONY: install.server
install.server:
	cd server && npm i

.PHONY: bootstrap.server
bootstrap.server:
	cd server && npx lerna bootstrap

.PHONY: install.client
install.client:
	cd client && npm i

.PHONY: bootstrap.client
bootstrap.client:
	cd client && npx lerna bootstrap


.PHONY: build-watch.server
build-watch.server:
	cd server && make build-watch

.PHONY: build-watch.client
build-watch.client:
	cd client && make build-watch

.PHONY: build-watch.client-bff
build-watch.client-bff:
	cd client && make build-watch-bff

.PHONY: codegen-watch.server
codegen-watch.server:
	cd server && make codegen-watch

.PHONY: codegen-watch.client
codegen-watch.client:
	cd client && make codegen-watch

.PHONY: lint-fix.client
lint-fix.client:
	cd client && make lint-fix

.PHONY: lint-fix.server
lint-fix.server:
	cd server && make lint-fix

.PHONY: lint.client
lint.client:
	cd client && make lint

.PHONY: lint.server
lint.server:
	cd server && make lint

.PHONY: lint-quiet.client
lint-quiet.client:
	cd client && make lint-quiet

.PHONY: lint-quiet.server
lint-quiet.server:
	cd server && make lint-quiet

.PHONY: lint-docker.client
lint-docker.client:
	docker-compose -f docker-compose-test.yml run --rm client make lint

.PHONY: lint-docker.server
lint-docker.server:
	docker-compose -f docker-compose-test.yml run --rm server make lint

.PHONY: test.server
test.server:
	docker-compose -f docker-compose-test.yml run --rm server make test

.PHONY: update-schema
update-schema:
	docker build -t server server
	docker run --rm server make render-schema > client/schema.json

.PHONY: serve
serve:
	skaffold dev --port-forward -p dev

.PHONY: serve-bff-less
serve-bff-less:
	skaffold dev --port-forward -p dev -p dev-bff-less


.PHONY: restart.client
restart.client:
	touch client/restart-dummy/`date +%s%3N`

.PHONY: restart.server
restart.server:
	touch server/restart-dummy/`date +%s%3N`
