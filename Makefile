# Makefile for managing docker-compose services

# Variables
DC = docker-compose

# Default rule
all: up

# Primary rules
up: ## Start the application
	@$(DC) up --build -d

down: ## Stop and remove all containers
	@$(DC) down

clean: down ## Clean the application
	@$(DC) rm -v
	@$(DC) down --volumes

re: fclean up ## Re-build and start the application

ref: fresh up ## Big fresh start the application

fclean:	## Force clean: stop all containers and prune the system
	@if [ -n "$$(docker ps -aq)" ]; then \
		docker stop $$(docker ps -aq); \
		docker rm $$(docker ps -aq); \
	fi
	@docker system prune -af

fresh: ## Reset the Docker environment to a completely fresh state
	@if [ -n "$$(docker ps -aq)" ]; then \
		echo "Stoping and removing all containers..."; \
		docker stop $$(docker ps -aq); \
		docker rm $$(docker ps -aq); \
	fi
	@if [ -n "$$(docker images -q)" ]; then \
		echo "Removing all images..."; \
		docker rmi -f $$(docker images -q); \
	fi
	@echo "Removing all volumes..."
	@docker volume prune -f
	@echo "Removing all networks..."
	@docker network prune -f
	@echo "Removing all build caches..."
	@docker builder prune -af
	@echo "Docker environment is now fresh!"


tail: ## Display logs for running containers in "follow" mode
	@$(DC) logs -f

logs: ## Display logs for all containers
	@$(DC) logs

# Declare phony targets
.PHONY: all up down clean fclean re tail logs reset reset_script
