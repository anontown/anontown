.PHONY: noop
noop:
	echo

.PHONY: migrate
migrate:
	echo unimplemented && exit 1

.PHONY: lint.fix
lint.fix:
	echo unimplemented && exit 1

.PHONY: test
test:
	echo unimplemented && exit 1

.PHONY: update-schema
update-schema:
	docker build -t server server
	docker run --rm server ./render-schema.sh > client/schema.json

.PHONY: serve
serve:
	skaffold dev --port-forward -p dev
