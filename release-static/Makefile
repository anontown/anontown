DATE := $(shell date +"%Y%m%d%H%M%S")

.PHONY: pull backup.cp-tmp backup.upload migrate stop clean data.chown up update backup restart

pull:
	git pull origin release
	docker-compose pull

backup.cp-tmp: stop data.chown
	mkdir /tmp/${DATE}
	cp -r  data /tmp/${DATE}/data
	cp .env /tmp/${DATE}/.env

backup.upload: backup.cp-tmp
	zip -r /tmp/${DATE}.zip /tmp/${DATE}
	skicka upload /tmp/${DATE}.zip anontown-bak/${DATE}.zip

migrate: stop
	docker-compose run --rm app npx lerna run migrate --scope @anontown/server

stop:
	docker-compose stop

clean: stop
	docker-compose rm -f

data.chown: stop
	sudo chown -R $$USER data

up: migrate
	docker-compose up -d

update: pull stop clean backup.cp-tmp migrate up backup.upload

backup: stop clean backup.cp-tmp up backup.upload

restart: stop clean up
