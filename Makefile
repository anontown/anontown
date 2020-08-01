.PHONY: noop
noop:
	echo

.PHONY: serve
serve:
	skaffold dev --port-forward -p dev
