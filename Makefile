install:
	npm install

build:
	rm -rf dist
	npm run build

start:
	npm run start

dev:
	npm run nodemon -- --watch src --ext '.js' --exec npm run rundev

test:
	npm test

lint:
	npm run eslint .

.PHONY: test
