.PHONY: noop
noop:
	echo

.PHONY: deps
deps:
	npm i
	npx lerna bootstrap

.PHONY: lint
lint:
	./bin/lint.sh

.PHONY: lint-fix
lint-fix:
	npm run lint:fix

.PHONY: lint-quiet
lint-quiet:
	./bin/lint-quiet.sh

.PHONY: restart
restart:
	touch restart-dummy/`date +%s%3N`

.PHONY: update-schema
update-schema:
	docker build -t server ../server
	docker run --rm server ./bin/render-schema.sh > schema.json
