DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_BUILD = $(DOCKER_COMPOSE) up --build -d
DOCKER_COMPOSE_RUN = $(DOCKER_COMPOSE) run --rm backend

# Команда для поднятия всех контейнеров
dev-full: build-containers start-backend

# Команда для сборки контейнеров
build-containers:
	$(DOCKER_COMPOSE_BUILD)

# Команда для запуска backend с nodemon
start-backend:
	$(DOCKER_COMPOSE_RUN) npm run start:dev