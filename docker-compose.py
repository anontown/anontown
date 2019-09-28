import sys
import json
import os


def get_mode():
    if os.environ["DC_ENV"] != "prod" and os.environ["DC_ENV"] != "dev" and os.environ["DC_ENV"] != "test":
        raise Exception()
    return os.environ["DC_ENV"]


def compose(mode):
    compose = {}
    compose["version"] = "3"
    compose["services"] = compose_services(mode)
    return compose


def compose_services(mode):
    services = {}
    services["app"] = compose_services_app(mode)
    services["mongo"] = compose_services_mongo(mode)
    if mode == "dev":
        services["mongo-express"] = compose_services_mongo_express(mode)
    services["es"] = compose_services_es(mode)
    if mode == "dev":
        services["es-head"] = compose_services_es_head(mode)
    services["redis"] = compose_services_redis(mode)
    return services


def compose_services_app(mode):
    service = {}
    service["build"] = "." if mode != "dev" else {
        "context": ".", "dockerfile": "dev.Dockerfile"}
    service["restart"] = "always"
    service["environment"] = {
        "SERVER_PORT": "8080",
        "MONGO_HOST": "mongo:27017",
        "ES_HOST": "es:9200",
        "REDIS_HOST": "redis:6379",
        "SAVE_DIR": "../../" if mode != "dev" else "../../data/app"
    }
    service["env_file"] = ".env" if mode != "test" else ".env.sample"
    if mode != "test":
        service["ports"] = ["8080:8080"]
    service["depends_on"] = ["mongo", "es", "redis"]
    if mode == "prod":
        service["volumes"] = ["./data/app/logs:/home/app/.anontown/logs",
                              "./data/app/data:/home/app/.anontown/data"]
    if mode == "dev":
        service["volumes"] = ["./:/home/app/.anontown"]

    return service


def compose_services_mongo(mode):
    service = {}
    service["restart"] = "always"
    service["image"] = "mongo:3.6.3"
    if mode != "test":
        service["volumes"] = ["./data/db:/data/db"]
    return service


def compose_services_mongo_express(mode):
    if mode != "dev":
        raise Exception()

    service = {}
    service["restart"] = "always"
    service["image"] = "mongo-express:0.40.0"
    service["ports"] = ["8081:8081"]
    service["depends_on"] = ["mongo"]
    return service


def compose_services_es(mode):
    service = {}
    service["build"] = "es"
    service["restart"] = "always"
    service["environment"] = {"ES_JAVA_OPTS": "-Xms512m -Xmx512m"}
    service["ulimits"] = {"nofile": {"soft": 65536, "hard": 65536}}
    if mode != "test":
        service["volumes"] = ["./data/es:/usr/share/elasticsearch/data"]
    return service


def compose_services_es_head(mode):
    if mode != "dev":
        raise Exception()

    service = {}
    service["image"] = "mobz/elasticsearch-head:5"
    service["restart"] = "always"
    service["ports"] = ["9100:9100"]
    service["depends_on"] = ["es"]
    return service


def compose_services_redis(mode):
    service = {}
    service["restart"] = "always"
    service["image"] = "redis:5.0.4"
    if mode != "test":
        service["volumes"] = ["./data/redis:/data"]
    service["command"] = "redis-server --appendonly yes"
    return service


mode = get_mode()
res = compose(mode)
print(json.dumps(res))
