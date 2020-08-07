.PHONY: noop
noop:
	echo

.PHONY: deps
deps:
	npm i
	npx lerna bootstrap

.PHONY: test
test:
	docker-compose -f docker-compose.test.yml build
	docker-compose -f docker-compose.test.yml run --rm app ./bin/test.sh

.PHONY: restart
restart:
	touch restart-dummy/`date +%s%3N`

.PHONY: chmod-bin
chmod-bin:
	chmod +x ./bin/*.sh
