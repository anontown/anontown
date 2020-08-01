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

.PHONY: test
test:
	docker-compose -f docker-compose.test.yml build
	docker-compose -f docker-compose.test.yml run --rm app ./bin/test.sh

.PHONY: restart
restart:
	touch restart-dummy/`date +%s%3N`
