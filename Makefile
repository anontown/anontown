.PHONY: noop
noop:
	echo

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

.PHONY: restart.client
restart.client:
	touch client/restart-dummy/`date +%s%3N`

.PHONY: restart.server
restart.server:
	touch server/restart-dummy/`date +%s%3N`
