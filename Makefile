check: lint test

lint:
	./node_modules/.bin/standard

test:
	./node_modules/.bin/tape test/*.js

.PHONY: check lint test
