.PHONY: noop migrate lint.fix test update-schema load-env serve

noop:
	echo

migrate:
	echo unimplemented && exit 1

lint.fix:
	echo unimplemented && exit 1

test:
	echo unimplemented && exit 1

update-schema:
	docker build -t server server
	docker run --rm server ./render-schema.sh > client/schema.json

load-env:
	kubectl delete secret secret || :
	kubectl create secret generic secret --from-env-file .secret
	kubectl delete configmap config || :
	kubectl create configmap config --from-env-file .config

serve:
	skaffold dev --port-forward
