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

.PHONY: test
test:
	docker-compose -f docker-compose.test.yml build
	docker-compose -f docker-compose.test.yml run --rm app ./bin/test.sh

.PHONY: restart
restart:
	touch restart-dummy/`date +%s%3N`
