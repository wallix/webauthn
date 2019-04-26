help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install:
	yarn install

run-example-api:
	cd example/api && yarn start

run-example-front:
	cd example/front && HTTPS=true yarn start
