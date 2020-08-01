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

.PHONY: restart
restart:
	touch restart-dummy/`date +%s%3N`

.PHONY: update-schema
update-schema:
	docker build -t server ../server
	docker run --rm server ./bin/render-schema.sh > schema.json
