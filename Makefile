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

.PHONY: load-env
load-env:
	kubectl delete secret secret || :
	kubectl create secret generic secret --from-env-file .secret
	kubectl delete configmap config || :
	kubectl create configmap config --from-env-file .config

.PHONY: serve
serve:
	skaffold dev --port-forward
