.PHONY: noop
noop:
	echo

.PHONY: lint.fix
lint.fix:
	echo unimplemented && exit 1

.PHONY: lint.client
lint.client:
	docker-compose -f docker-compose-test.yml run --rm client ./bin/lint.sh

.PHONY: lint.server
lint.server:
	docker-compose -f docker-compose-test.yml run --rm server ./bin/lint.sh

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
