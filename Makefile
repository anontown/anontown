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
	cd server && ./bin/build-watch.sh

.PHONY: build-watch.client
build-watch.client:
	cd client && ./bin/build-watch.sh

.PHONY: build-watch.client-bff
build-watch.client-bff:
	cd client && ./bin/build-watch-bff.sh

.PHONY: codegen-watch.server
codegen-watch.server:
	cd server && ./bin/codegen-watch.sh

.PHONY: codegen-watch.client
codegen-watch.client:
	cd client && ./bin/codegen-watch.sh

.PHONY: lint-fix.client
lint-fix.client:
	cd client && ./bin/lint-fix.sh

.PHONY: lint-fix.server
lint-fix.server:
	cd server && ./bin/lint-fix.sh

.PHONY: lint.client
lint.client:
	cd client && ./bin/lint.sh

.PHONY: lint.server
lint.server:
	cd server && ./bin/lint.sh

.PHONY: lint-quiet.client
lint-quiet.client:
	cd client && ./bin/lint-quiet.sh

.PHONY: lint-quiet.server
lint-quiet.server:
	cd server && ./bin/lint-quiet.sh

.PHONY: test.server
test.server:
	docker-compose -f docker-compose-test.yml run --rm server ./bin/test.sh

.PHONY: update-schema
update-schema:
	docker build -t server server
	docker run --rm server ./bin/render-schema.sh > client/schema.json

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
